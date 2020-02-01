const fs = require("fs");
const path = require("path");

const csv = require("neat-csv");
const pgp = require("pg-promise")();
const {
    DateTime,
    Duration
} = require("luxon");

const config = require("../config");
const logger = require("../logging");

/**
 * The files in the directory must be named in the form `{synopid}-{field}.txt`, e.g. `10035-sonne.txt`.
 *
 * @param synopId the SYNOP id of the station to import, must be 5 digits
 * @param csvDirectory a directory containing files for `sonne`, `regen`, and `t` (temperature)
 * @param startDate {string} the start date of the import in the form `YYYY-MM-DD`
 * @return {Promise<boolean>}
 */
module.exports = async function(synopId, csvDirectory, startDate) {
    const sonneCSV = fs.readFileSync(path.join(csvDirectory, `${synopId}-sonne.csv`), "utf8");
    const regenCSV = fs.readFileSync(path.join(csvDirectory, `${synopId}-regen.csv`), "utf8");
    const tCSV = fs.readFileSync(path.join(csvDirectory, `${synopId}-t.csv`), "utf8");

    const sonneData = await csv(sonneCSV.replace(/;null,/g, ";'null';"), {
        separator: ";",
        escape: "'",
        quote: "'",
        headers: ["synop", "name", "level", "date", "time", "value", "unit", "timestamp"]
    });
    const regenData = await csv(regenCSV.replace(/;null,/g, ";'null';"), {
        separator: ";",
        escape: "'",
        quote: "'",
        headers: ["synop", "name", "level", "date", "time", "value", "unit", "timestamp"]
    });
    const tData = await csv(tCSV.replace(/;null,/g, ";'null';"), {
        separator: ";",
        escape: "'",
        quote: "'",
        headers: ["synop", "name", "level", "date", "time", "value", "unit", "timestamp"]
    });

    logger.info(`Found ${sonneData.length} rows in sonne data.`);
    logger.info(`Found ${regenData.length} rows in regen data.`);
    logger.info(`Found ${tData.length} rows in t data.`);

    if (sonneData.length !== regenData.length || regenData.length !== tData.length) {
        logger.error("Please check if all files contain the same amount of exported dates!");
        return Promise.reject(Error("Input files have a different row count!"));
    }

    let currentDateTime = DateTime.fromFormat(`${startDate} 00:00`, "yyyy-MM-dd HH:mm", {
        zone: "Europe/Vienna",
        locale: "de-AT"
    });

    const endDateTime = DateTime.fromFormat(`${tData[tData.length - 1].date} ${tData[tData.length - 1].time}`, "yyyy-MM-dd HH:mm", {
        zone: "Europe/Vienna",
        locale: "de-AT"
    });

    logger.info(`Importing from ${currentDateTime.toISO()} to ${endDateTime.toISO()}`);

    // prepare the database transaction
    const db = pgp(config.get("db"));

    // mapping for properties on database table's columns
    const cs = new pgp.helpers.ColumnSet([
        {name: "wet_synop_id", prop: "synopId"},
        {name: "wet_timestamp", prop: "timestamp"},
        {name: "wet_sunshine", prop: "sunshine", cast: "int" },
        {name: "wet_rain", prop: "rain", cast: "double precision" },
        {name: "wet_temperature", prop: "temperature", cast: "double precision" }
    ], {table: "smai_weather"});

    // loop over all possible timestamps for weather data (which is available for every hour)
    let counter = 0;
    await db.tx("massive-snapshot-insert", async t => {
        let insertBuffer = [];

        while (currentDateTime <= endDateTime) {
            const date = currentDateTime.toFormat("yyyy-MM-dd");
            const time = currentDateTime.toFormat("HH:mm");

            currentDateTime = currentDateTime.plus(Duration.fromObject({ hours: 1 }));

            const sonneRow = sonneData.find(row => row.date === date && row.time === time);
            const regenRow = regenData.find(row => row.date === date && row.time === time);
            const tRow = tData.find(row => row.date === date && row.time === time);

            if (sonneRow === undefined || regenRow === undefined || tRow === undefined) {
                logger.warn(`Skipping missing row for ${currentDateTime.toISO()}`);
                continue;
            }

            // drop null values
            if (sonneRow.value === "null") {
                logger.warn(`Missing sun value for ${currentDateTime.toISO()}`);
                sonneRow.value = null;
            } else if (regenRow.value === "null") {
                logger.warn(`Missing rain value for ${currentDateTime.toISO()}`);
                regenRow.value = null;
            } else if (tRow.value === "null") {
                logger.warn(`Missing temperature value for ${currentDateTime.toISO()}`);
                tRow.value = null;
            }

            insertBuffer.push({
                synopId,
                timestamp: currentDateTime.toUTC().toSQL(),
                sunshine: sonneRow.value !== null ? Number.parseInt(sonneRow.value) : null,
                rain: regenRow.value !== null ? Number.parseFloat(regenRow.value) : null,
                temperature: tRow.value !== null ? Number.parseFloat(tRow.value) : null
            });

            counter ++;

            if (insertBuffer.length >= 1000) {
                await t.none(pgp.helpers.insert(insertBuffer, cs));
                logger.info(`Added ${counter} weather records to the transaction.`);
                insertBuffer = [];
            }
        }

        // puts remaining weather data into the transaction, commits afterwards
        await t.none(pgp.helpers.insert(insertBuffer, cs));
        logger.info(`Added ${counter} weather records to the transaction.`);

        // to free the buffer's memory asap de-reference it
        insertBuffer = null;
    });

    logger.info(`Commited the transaction with ${counter} weather records.`);
};
