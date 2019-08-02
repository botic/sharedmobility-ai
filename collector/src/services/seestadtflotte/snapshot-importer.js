const {
    Info,
    DateTime
} = require("luxon");
const pgp = require("pg-promise")();

const config = require("../../config");
const logger = require("../../logging");
const {
    STATION_OPERATIONAL,
    STATION_OUTAGE,
    SEESTADTFLOTTE_TIMEZONE,
    SEESTADTFLOTTE_SERVICE_SLUG
} = require("../../constants");

const targzIterator = require("../../targz-iterator");

module.exports = async (inputFile) => {
    // should be no problem for Node >= 6
    // https://moment.github.io/luxon/docs/manual/matrix.html
    if (Info.features().zones !== true) {
        throw new Error("Your current environment has no built-in support for Luxon advanced timezones!");
    }

    const db = pgp(config.get("db"));
    const stations = await getStations(db);

    // reads the tar.gz and inserts purified snapshots into the database inside a massive transaction
    await importSnapshots(db, inputFile, stations);
};

/**
 * Asynchronously reads the given input .tar.gz and batch inserts it into the database using a massive transaction.
 * @param {string} inputFile path to the compressed input archive
 * @param {Database} db shared pg-promise database protocol object
 * @param {Array} stations list of existing rental stations
 * @return {Promise<any>} promise resolves if all entries have been inserted into the database
 */
async function importSnapshots(db, inputFile, stations) {
    return targzIterator(db, inputFile, (obj, header) => {
        if (!Array.isArray(obj.stationlist) || obj.stationlist.length === 0) {
            return [];
        }

        const smaiSnapshots = [];
        const fileDateTime = filenameToDateTime(header.name, SEESTADTFLOTTE_TIMEZONE);
        const sycSnapshots = processStationList(obj.stationlist);

        for (const sycSnapshot of sycSnapshots) {
            const {id} = stations.find(station => station.internalId === String(sycSnapshot.station.id));
            smaiSnapshots.push({
                smaiId: id,
                timestamp: fileDateTime.toUTC().toSQL(),
                stationStatus: sycSnapshot.snapshot.stationStatus,
                vehiclesAvailable: sycSnapshot.snapshot.vehiclesAvailable,
                vehiclesFaulty: sycSnapshot.snapshot.vehiclesFaulty,
                boxesAvailable: sycSnapshot.snapshot.boxesAvailable,
                boxesFaulty: sycSnapshot.snapshot.boxesFaulty
            });
        }

        return smaiSnapshots;
    });
}

/**
 * Iterates over the stationList of a raw snapshot file.
 * @type {function(Array): Array}
 * @returns {Array} array of SMAI compatible snapshot objects
 */
function processStationList(stationList) {
    const snapshotBuffer = [];

    // converts all raw station data into interim snapshot objects
    for (const station of stationList) {
        snapshotBuffer.push({
            station,
            snapshot: stationToSnapshot(station)
        });
    }

    return snapshotBuffer;
}

/**
 * Converts the raw station object from a tar entry into a SMAI compatible snapshot.
 * @type {function(Object): Object}
 * @return {Object} a prototype-free object suitable as snapshot source
 */
function stationToSnapshot(station) {
    const snapshot = Object.create(null);

    snapshot.stationStatus = station.offline === false ? STATION_OPERATIONAL : STATION_OUTAGE;
    snapshot.vehiclesAvailable = station.bikeCnt + station.ebikeCnt;
    snapshot.vehiclesFaulty = 0;
    snapshot.boxesAvailable = station.emptyCnt;
    snapshot.boxesFaulty = station.boxErrCnt + station.boxOfflineCnt;

    return snapshot;
}

/**
 * Returns the timestamp in milliseconds for the given filename.
 *
 * @type {function(string, string): DateTime}
 * @param {string} filename the filename in the format './seestadtFlotte-2018-09-12__22_35_01.json'
 * @param {string} stationTimezoneName IANA timezone name, e.g. 'Europe/Vienna'
 * @returns {DateTime} a Luxon DateTime object representing the create time of the given filename
 */
function filenameToDateTime(filename, stationTimezoneName) {
    const parts = filename.match(/^(?:\.\/)?seestadtFlotte-(20\d{2}-\d{2}-\d{2})__([012]\d_[012345]\d_[012345]\d)\.json$/);
    if (!parts || parts.length !== 3) {
        logger.error("Invalid filename! " + filename);
        return null;
    }

    return DateTime.fromISO(`${parts[1]}T${parts[2].replace(/_/g, ":")}`, { zone: stationTimezoneName });
}

async function getServiceId(db) {
    const {ser_id} = await db.one({
        name: "check-seestadtflotte-service",
        text: "SELECT ser_id FROM smai_service WHERE ser_slug = $1",
        values: [SEESTADTFLOTTE_SERVICE_SLUG]
    });
    return ser_id;
}

async function getStations(db) {
    const stations = await db.manyOrNone("SELECT sta_id, sta_internal_identifier FROM smai_station WHERE sta_ser_id = $1", [
        await getServiceId(db)
    ]);

    return stations.map(station => {
        return {
            id: station["sta_id"],
            internalId: station["sta_internal_identifier"]
        }
    });
}