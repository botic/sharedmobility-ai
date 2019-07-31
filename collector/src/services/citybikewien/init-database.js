const slugify = require("slugify");
const pgp = require("pg-promise")();

const config = require("../../config");
const logger = require("../../logging");

const findStations = require("./tar-readers/station-finder");

const {
    CITYBIKEWIEN_SERVICE_SLUG,
    CITYBIKEWIEN_STATION_PREFIX
} = require("../../constants");

module.exports = async function(inputFile) {
    const db = pgp(config.get("db"));

    // before starting with the import:
    // check if database is available and has empty tables
    try {
        await Promise.all([
            checkService(db),
            checkStations(db)
        ]);
    } catch (e) {
        logger.error(`Could not resolve all checks.`, e);
        db.$pool.end();
        return;
    }

    try {
        // step 1: collect all stations
        logger.info(`Looking for stations ...`);
        const stations = await findStations(inputFile);
        logger.info(`Found ${stations.length} stations.`);

        // step 2: write the station information into the database
        await initializeData(db, stations);
        logger.info("Finished initialization.");
    } catch (e) {
        logger.error(`Could not initialize database!`, e);
    } finally {
        db.$pool.end();
    }
};

async function checkService(db) {
    try {
        await db.none({
            name: "check-citybikewien-service",
            text: "SELECT * FROM smai_service WHERE ser_slug = $1",
            values: [CITYBIKEWIEN_SERVICE_SLUG]
        });

        logger.debug(`Service ${CITYBIKEWIEN_SERVICE_SLUG} does not exist yet.`);
    } catch (e) {
        logger.error(`Could not initialize service ${CITYBIKEWIEN_SERVICE_SLUG}`, e);
        throw e;
    }
}

async function checkStations(db) {
    try {
        await db.none(`SELECT * FROM smai_station WHERE sta_slug LIKE '${CITYBIKEWIEN_STATION_PREFIX}%'`);
        logger.debug(`No stations found for ${CITYBIKEWIEN_STATION_PREFIX}.`);
    } catch(e) {
        logger.error(`Stations with prefix ${CITYBIKEWIEN_STATION_PREFIX} already exist!`, e);
        throw e;
    }
}

async function initializeData(db, stations) {
    try {
        const {ser_id} = await db.one("INSERT INTO smai_service(ser_slug, ser_name, ser_description, ser_url) VALUES($1, $2, $3, $4) RETURNING ser_id", [
            CITYBIKEWIEN_SERVICE_SLUG,
            "Citybike Wien",
            "Citybike Wien betreibt 1.500 Leihräder an 121 Stationen über das gesamte Jahr. Voraussetzung für die Benutzung von Citybike Wien ist eine einmalige Anmeldung.",
            "https://www.citybikewien.at/"
        ]);
        logger.debug(`Created service with id ${ser_id}`);

        try {
            for (const station of stations) {
                const {sta_id} = await db.one("INSERT INTO smai_station(" +
                    "sta_ser_id, sta_slug, sta_internal_identifier, sta_internal_name, sta_external_name, sta_description, sta_url, sta_address, sta_longitude, sta_latitude, sta_timezone_name" +
                    ") VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING sta_id", [
                    ser_id,
                    (CITYBIKEWIEN_STATION_PREFIX + slugify(station.name)).toLowerCase(),
                    `${station.internalId}-${station.id}`,
                    station.name,
                    "Citybike Wien – " + station.name,
                    station.description,
                    "https://www.citybikewien.at/",
                    "",
                    station.longitude,
                    station.latitude,
                    "Europe/Vienna"
                ]);
                logger.debug(`Created station with id ${sta_id}`);
            }
        } catch (e) {
            logger.error(`Could not create stations! ${e}`);
            return Promise.reject(e);
        }
    } catch (e) {
        logger.error(`Could not create service! ${e}`);
        return Promise.reject(e);
    }

    return Promise.resolve();
}