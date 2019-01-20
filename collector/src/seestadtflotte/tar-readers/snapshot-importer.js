const fs = require("fs");

const tar = require("tar-stream");
const pgp = require("pg-promise")();
const gunzip = require("gunzip-maybe");
const concat = require("concat-stream");
const {DateTime} = require("luxon");
const {EventIterator} = require("event-iterator");

const logger = require("../../logging");
const {
    STATION_OPERATIONAL,
    STATION_OUTAGE,
    SEESTADTFLOTTE_TIMEZONE
} = require("../../constants");

/**
 * Asynchronously reads the given input .tar.gz and batch inserts it into the database using a massive transaction.
 * @param {string} inputFile path to the compressed input archive
 * @param {Database} db shared pg-promise database protocol object
 * @param {Array} stations list of existing rental stations
 * @return {Promise<any>} promise resolves if all entries have been inserted into the database
 */
module.exports = async function(inputFile, db, stations) {
    function stream() {
        let helper;
        return new EventIterator(
            (push, stop, fail) => {
                // this function will be called if the tar reader emits a new entry
                // header => the tar header
                // stream => the content body as stream
                // next => callback to notify the tar-stream reader after processing the entry
                helper = (header, stream, next) => {
                    // concat all stream parts into a single buffer
                    stream.pipe(concat((data) => {
                        // data is quite large since it carries so many non-relevant details,
                        // though parsing should take not to long, so use the standard blocking one
                        const obj = JSON.parse(data.toString());

                        // security check: is the object valid?
                        if (Array.isArray(obj.stationlist) && obj.stationlist.length > 0) {
                            const fileDateTime = filenameToDateTime(header.name, SEESTADTFLOTTE_TIMEZONE);
                            const sycSnapshots = processStationList(obj.stationlist);

                            // creates an array of snapshots ready to insert
                            const smaiSnapshots = [];
                            for (const sycSnapshot of sycSnapshots) {
                                const {id} = stations.find(station => station.internalId === String(sycSnapshot.station.id));

                                smaiSnapshots.push({
                                    internalId: id,
                                    timestamp: fileDateTime.toUTC().toSQL(),
                                    stationStatus: sycSnapshot.snapshot.stationStatus,
                                    vehiclesAvailable: sycSnapshot.snapshot.vehiclesAvailable,
                                    vehiclesFaulty: sycSnapshot.snapshot.vehiclesFaulty,
                                    boxesAvailable: sycSnapshot.snapshot.boxesAvailable,
                                    boxesFaulty: sycSnapshot.snapshot.boxesFaulty
                                });
                            }

                            // the tricky asynchronous part: the db transaction insertion must
                            //   1.) insert the given snapshots
                            //   2.) subsequently call next() to notify the tar reader for continuation
                            //
                            // we use EventIterator's push() to yield into the async iterable for-wait-of loop
                            push({
                                smaiSnapshots,
                                next
                            });
                        }
                    }));
                };

                this.addListener("entry", helper);
                this.addListener("finish", stop);
                this.addListener("error", fail);
            },
            (push, stop, fail) => {
                this.removeListener("entry", helper);
                this.removeListener("finish", stop);
                this.removeListener("error", fail);
                this.destroy();
            }
        )
    }

    const tarStream = fs.createReadStream(inputFile).pipe(gunzip()).pipe(tar.extract());
    const rs = stream.call(tarStream);

    // name => the table's column name
    // prop => the data object's property to use for the column
    const cs = new pgp.helpers.ColumnSet([
        {name: "snp_sta_id", prop: "internalId"},
        {name: "snp_timestamp", prop: "timestamp"},
        {name: "snp_station_status", prop: "stationStatus"},
        {name: "snp_vehicles_available", prop: "vehiclesAvailable"},
        {name: "snp_vehicles_faulty", prop: "vehiclesFaulty"},
        {name: "snp_boxes_available", prop: "boxesAvailable"},
        {name: "snp_boxes_faulty", prop: "boxesFaulty"},
    ], {table: "smai_snapshot"});

    // this promise spans the _whole_ transaction, it will take some time to resolve ...
    return new Promise((resolve, reject) => {
        let counter = 0;
        db.tx("massive-snapshot-insert", async t => {
            // to keep the performance of the inserts high,
            // buffer 10,000 snapshots into a single batch insert
            let insertBuffer = [];
            for await(const tarEntry of rs) {
                insertBuffer = insertBuffer.concat(tarEntry.smaiSnapshots);
                counter += tarEntry.smaiSnapshots.length;

                if (insertBuffer.length >= 10000) {
                    await t.none(pgp.helpers.insert(insertBuffer, cs));
                    logger.info(`Added ${counter} snapshots to the transaction.`);
                    insertBuffer = [];
                }

                tarEntry.next();
            }

            // flush the remaining snapshots into the transaction, commit it afterwards
            await t.none(pgp.helpers.insert(insertBuffer, cs));
            logger.info(`Added ${counter} snapshots to the transaction.`);

            // to free the buffer's memory asap de-reference it
            insertBuffer = null;
        })
        .then(data => {
            logger.info("Transaction commit! Inserted all records.");
            resolve();
        })
        .catch(e => {
            logger.error("Transaction rollback!", e);
            reject();
        });
    });
};

/**
 * Iterates over the stationList of a raw snapshot file.
 * @type {function(Array): Array}
 * @returns {Array} array of SMAI compatible snapshot objects
 */
const processStationList = exports.processStationList = function(stationList) {
    const snapshotBuffer = [];

    // converts all raw station data into interim snapshot objects
    for (const station of stationList) {
        snapshotBuffer.push({
            station,
            snapshot: stationToSnapshot(station)
        });
    }

    return snapshotBuffer;
};

/**
 * Converts the raw station object from a tar entry into a SMAI compatible snapshot.
 * @type {function(Object): Object}
 * @return {Object} a prototype-free object suitable as snapshot source
 */
const stationToSnapshot = exports.stationToSnapshot = function(station) {
    const snapshot = Object.create(null);

    snapshot.stationStatus = station.offline === false ? STATION_OPERATIONAL : STATION_OUTAGE;
    snapshot.vehiclesAvailable = station.bikeCnt + station.ebikeCnt;
    snapshot.vehiclesFaulty = 0;
    snapshot.boxesAvailable = station.emptyCnt;
    snapshot.boxesFaulty = station.boxErrCnt + station.boxOfflineCnt;

    return snapshot;
};

/**
 * Returns the timestamp in milliseconds for the given filename.
 *
 * @type {function(string, string): DateTime}
 * @param {string} filename the filename in the format './seestadtFlotte-2018-09-12__22_35_01.json'
 * @param {string} stationTimezoneName IANA timezone name, e.g. 'Europe/Vienna'
 * @returns {DateTime} a Luxon DateTime object representing the create time of the given filename
 */
const filenameToDateTime = exports.filenameToDateTime = function(filename, stationTimezoneName) {
    const parts = filename.match(/^(?:\.\/)?seestadtFlotte-(20\d{2}-\d{2}-\d{2})__([012]\d_[012345]\d_[012345]\d)\.json$/);
    if (!parts || parts.length !== 3) {
        logger.error("Invalid filename! " + filename);
        return null;
    }

    return DateTime.fromISO(`${parts[1]}T${parts[2].replace(/_/g, ":")}`, { zone: stationTimezoneName });
};
