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
    CITYBIKEWIEN_TIMEZONE,
    CITYBIKEWIEN_SERVICE_SLUG
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
    const ignoredStations = config.get("ignoredStations:citybikewien") || [];

    return targzIterator(db, inputFile, (obj, header) => {
        if (!Array.isArray(obj.network.stations) || obj.network.stations.length === 0) {
            return [];
        }

        const smaiSnapshots = [];
        const fileDateTime = filenameToDateTime(header.name, CITYBIKEWIEN_TIMEZONE);
        const citybikeSnapshots = processStationList(obj.network.stations);

        for (const citybikeSnapshot of citybikeSnapshots) {
            const station = stations.find(
                station => station.internalId === `${citybikeSnapshot.station.extra.internal_id}`
            );

            if (station) {
                smaiSnapshots.push({
                    smaiId: station.id,
                    timestamp: fileDateTime.toUTC().toSQL(),
                    stationStatus: citybikeSnapshot.snapshot.stationStatus,
                    vehiclesAvailable: citybikeSnapshot.snapshot.vehiclesAvailable,
                    vehiclesFaulty: citybikeSnapshot.snapshot.vehiclesFaulty,
                    boxesAvailable: citybikeSnapshot.snapshot.boxesAvailable,
                    boxesFaulty: citybikeSnapshot.snapshot.boxesFaulty
                });
            } else if (ignoredStations.indexOf(citybikeSnapshot.station.extra.internal_id) !== -1) {
                logger.debug(`Ignoring Citybike station with id ${citybikeSnapshot.station.extra.internal_id}`);
            } else {
                logger.debug(`Could not find Citybike station with id ${citybikeSnapshot.station.extra.internal_id}`);
                logger.debug(JSON.stringify(citybikeSnapshot, null, 2));
            }
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

    const slots = parseInt(station.extra.slots, 10);
    snapshot.stationStatus = (station.extra.status || "").toLowerCase() === "aktiv" ? STATION_OPERATIONAL : STATION_OUTAGE;
    snapshot.vehiclesAvailable = station.free_bikes || 0;
    snapshot.vehiclesFaulty = 0;
    snapshot.boxesAvailable = station.empty_slots;
    snapshot.boxesFaulty = slots > 0 && slots < (station.empty_slots + station.free_bikes)
        ? slots - (station.empty_slots + station.free_bikes)
        : 0;

    return snapshot;
}

/**
 * Returns the timestamp in milliseconds for the given filename.
 *
 * @type {function(string, string): DateTime}
 * @param {string} filename the filename in the format './citybike-2018-09-12__22_35_01.json'
 * @param {string} stationTimezoneName IANA timezone name, e.g. 'Europe/Vienna'
 * @returns {DateTime} a Luxon DateTime object representing the create time of the given filename
 */
function filenameToDateTime(filename, stationTimezoneName) {
    const parts = filename.match(/^(?:\.\/)?(?:var\/)?(?:station-snapshots\/)?citybike-(20\d{2}-\d{2}-\d{2})__([012]\d_[012345]\d_[012345]\d)\.json$/);
    if (!parts || parts.length !== 3) {
        logger.error("Invalid filename! " + filename);
        return null;
    }

    return DateTime.fromISO(`${parts[1]}T${parts[2].replace(/_/g, ":")}`, { zone: stationTimezoneName });
}

async function getServiceId(db) {
    const {ser_id} = await db.one({
        name: "check-citybikewien-service",
        text: "SELECT ser_id FROM smai_service WHERE ser_slug = $1",
        values: [CITYBIKEWIEN_SERVICE_SLUG]
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
