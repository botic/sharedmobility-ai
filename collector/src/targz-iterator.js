const fs = require("fs");

const tar = require("tar-stream");
const pgp = require("pg-promise")();
const gunzip = require("gunzip-maybe");
const concat = require("concat-stream");
const {DateTime} = require("luxon");
const {EventIterator} = require("event-iterator");

const logger = require("./logging");

/** @ignore */
function isString(str) {
    return typeof str === "string" || str instanceof String;
}

/**
 * Validates the given smai snapshot.
 *
 * @param snapshot {Object} snapshot to validate
 * @return {boolean} true if a valid snapshot, false otherwise
 */
function isValidSnapshot(snapshot) {
    return typeof snapshot === "object" &&
        Object.keys(snapshot).every(
            key => ["smaiId", "timestamp", "stationStatus", "vehiclesAvailable", "vehiclesFaulty", "boxesAvailable", "boxesFaulty"].indexOf(key) >= 0
        ) &&
        snapshot.hasOwnProperty("smaiId") && Number.isSafeInteger(snapshot.smaiId) &&
        snapshot.hasOwnProperty("timestamp") && isString(snapshot.timestamp) &&
        snapshot.hasOwnProperty("stationStatus") && isString(snapshot.stationStatus) &&
        snapshot.hasOwnProperty("vehiclesAvailable") && Number.isSafeInteger(snapshot.vehiclesAvailable) &&
        snapshot.hasOwnProperty("vehiclesFaulty") && Number.isSafeInteger(snapshot.vehiclesFaulty) &&
        snapshot.hasOwnProperty("boxesAvailable") && Number.isSafeInteger(snapshot.boxesAvailable) &&
        snapshot.hasOwnProperty("boxesFaulty") && Number.isSafeInteger(snapshot.boxesFaulty);
}

/**
 * The snapshot converter callback is called every time a new snapshot file has been read.
 * It's provided the raw JSON object and the tar file's header and converts the snapshot into an
 * array of smai snapshots which will be imported into the database later.
 *
 * @callback snapshotConverter
 * @param {Object} snapshot the read snapshot
 * @param {Object} header tar header with properties like name, size, mode, mtime, linkname, uid, gid, ...
 * @return {Array} an array of smai compatible snapshots ready to be imported into the database
 *
 * @see {@link https://www.npmjs.com/package/tar-stream#headers tar-stream Headers}
 */

/**
 * Reads a `.tar.gz` file and imports it into the database.
 *
 * @param db {Database} a pg-promise database protocol
 * @param inputFile {String} path to the input `.tar.gz` file containing all JSON snapshots
 * @param snapshotConverter {snapshotConverter} callback
 * @return {Promise<Promise<unknown>>}
 */
module.exports = async function(db, inputFile, snapshotConverter) {
    function stream() {
        let helper;
        return new EventIterator(
            (push, stop, fail) => {
                // this function will be called if the tar reader emits a new entry
                // header => the tar header
                // stream => the content body as stream
                // next => callback to notify the tar-stream reader after processing the entry
                helper = (header, stream, next) => {
                    // snapshots must have at least 100 bytes to be parsed
                    if (header.size < 100) {
                        push({
                            smaiSnapshots: [],
                            next
                        });

                        return;
                    }

                    // concat all stream parts into a single buffer
                    stream.pipe(concat((data) => {
                        // data is quite large since it carries so many non-relevant details,
                        // though parsing should take not to long, so use the standard blocking one
                        const obj = JSON.parse(data.toString());

                        const smaiSnapshots = snapshotConverter(obj, header);
                        if (!Array.isArray(smaiSnapshots)) {
                            fail(Error(`A snapshot converter must return an array of snapshots, but returned ${typeof smaiSnapshots}`));
                        }

                        // validates every converted snapshot
                        const invalidSnapshot = smaiSnapshots.find(snapshot => !isValidSnapshot(snapshot));
                        if (invalidSnapshot !== undefined) {
                            fail(Error(`Invalid snapshot provided by the snapshot converter function!\n${JSON.stringify(invalidSnapshot, null, 2)}`));
                        }

                        // security check: is the object valid?
                        if (smaiSnapshots.length > 0) {
                            // the tricky asynchronous part: the db transaction insertion must
                            //   1.) insert the given snapshots
                            //   2.) subsequently call next() to notify the tar reader for continuation
                            //
                            // we use EventIterator's push() to yield into the async iterable for-wait-of loop
                            push({
                                smaiSnapshots,
                                next
                            });
                        } else {
                            fail(Error(`No snapshots returned by the converter!`));
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
        {name: "snp_sta_id", prop: "smaiId"},
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