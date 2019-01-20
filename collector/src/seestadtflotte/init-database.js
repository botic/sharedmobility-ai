const slugify = require("slugify");
const pgp = require("pg-promise")();

const config = require("../config");
const logger = require("../logging");

const findStations = require("./tar-readers/station-finder");
const stationCoverageCheck = require("./tar-readers/station-coverage");

const {
    SEESTADTFLOTTE_SERVICE_SLUG,
    SEESTADTFLOTTE_STATION_PREFIX
} = require("../constants");

module.exports = async function(inputFile) {
    const db = pgp(config.get("db"));

    // step 1: check if database is available and has empty tables
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

    // step 2: collect all stations
    try {
        logger.info(`Looking for stations ...`);
        const stations = await findStations(inputFile);
        logger.info(`Found ${stations.length} stations.`);

        logger.info(`Check coverage of each file in the archive ...`);
        const coverage = await stationCoverageCheck(stations, inputFile);

        if (coverage === 0) {
            logger.info(`Perfect coverage.`);

            // step 3: write the station information into the database
            await initializeData(db, stations);
            logger.info("Finished initialization.");
        } else {
            logger.error(`Input archive has at least ${Math.abs(coverage)} files with invalid stations!`);
        }
    } catch (e) {
        logger.error(`Could not initialize database!`, e);
    } finally {
        db.$pool.end();
    }
};

async function checkService(db) {
    try {
        await db.none({
            name: "check-seestadtflotte-service",
            text: "SELECT * FROM smai_service WHERE ser_slug = $1",
            values: [SEESTADTFLOTTE_SERVICE_SLUG]
        });

        logger.debug(`Service ${SEESTADTFLOTTE_SERVICE_SLUG} does not exist yet.`);
    } catch (e) {
        logger.error(`Could not initialize service ${SEESTADTFLOTTE_SERVICE_SLUG}`, e);
        throw e;
    }
}

async function checkStations(db) {
    try {
        await db.none(`SELECT * FROM smai_station WHERE sta_slug LIKE '${SEESTADTFLOTTE_STATION_PREFIX}%'`);
        logger.debug(`No stations found for ${SEESTADTFLOTTE_STATION_PREFIX}.`);
    } catch(e) {
        logger.error(`Stations with prefix ${SEESTADTFLOTTE_STATION_PREFIX} already exist!`, e);
        throw e;
    }
}

async function initializeData(db, stations) {
    try {
        const {ser_id} = await db.one("INSERT INTO smai_service(ser_slug, ser_name, ser_description, ser_url) VALUES($1, $2, $3, $4) RETURNING ser_id", [
            SEESTADTFLOTTE_SERVICE_SLUG,
            "SeestadtFLOTTE",
            "Die SeestadtFLOTTE ist das Radverleihsystem der Seestadt. An verschiedenen Stationen können insgesamt 56 E-Bikes und Acht-Gang-Räder ausgeborgt werden.",
            "https://www.aspern-seestadt.at/lebenswelt/mobilitaet/mit_dem_rad"
        ]);
        logger.debug(`Created service with id ${ser_id}`);

        try {
            for (const station of stations) {
                const {sta_id} = await db.one("INSERT INTO smai_station(" +
                    "sta_ser_id, sta_slug, sta_internal_identifier, sta_internal_name, sta_external_name, sta_description, sta_url, sta_address, sta_longitude, sta_latitude, sta_timezone_name" +
                    ") VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING sta_id", [
                    ser_id,
                    (SEESTADTFLOTTE_STATION_PREFIX + slugify(station.name)).toLowerCase(),
                    String(station.id),
                    station.name,
                    "SeestadtFLOTTE – " + station.name,
                    "Station der SeestadtFLOTTE in der Seestadt Aspern.",
                    "https://www.aspern-seestadt.at/lebenswelt/mobilitaet/mit_dem_rad",
                    station.address,
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