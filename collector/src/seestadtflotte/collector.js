const {Info} = require("luxon");
const pgp = require("pg-promise")();

const config = require("../config");
const snapshotImporter = require("./tar-readers/snapshot-importer");
const {SEESTADTFLOTTE_SERVICE_SLUG} = require("../constants");

module.exports = async (inputFile) => {
    // should be no problem for Node >= 6
    // https://moment.github.io/luxon/docs/manual/matrix.html
    if (Info.features().zones !== true) {
        throw new Error("Your current environment has no built-in support for Luxon advanced timezones!");
    }

    const db = pgp(config.get("db"));
    const stations = await getStations(db);

    // reads the tar.gz and inserts purified snapshots into the database inside a massive transaction
    await snapshotImporter(inputFile, db, stations);
};

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