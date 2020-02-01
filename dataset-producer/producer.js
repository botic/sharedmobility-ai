const fs = require("fs");
const path = require("path");

const { DateTime } = require("luxon");
const pgp = require("pg-promise")();

const config = require("./config");
const HOLIDAYS = config.get("holidays");

module.exports = async function(serviceId, startDate, endDate, outputPath) {
    if (!fs.lstatSync(outputPath).isDirectory()) {
        throw new Error(`Not a directory! ${outputPath}`);
    }

    if (!Array.isArray(HOLIDAYS)) {
        throw new Error(`Config error: 'holidays' property is not an array!`);
    }

    const startDT = DateTime.fromFormat(`${startDate} 00:00`, "yyyy-MM-dd HH:mm", { zone: config.get("timeZone") });
    const endDT = DateTime.fromFormat(`${endDate} 00:00`, "yyyy-MM-dd HH:mm", { zone: config.get("timeZone") });

    if (startDT > endDT) {
        throw new Error("Start date is after end date!");
    } else if (!startDT.isValid || !endDT.isValid) {
        throw new Error("Invalid dates provided!");
    }

    const db = pgp(config.get("db"));
    const stations = await getStations(db, serviceId);

    if (stations.length === 0) {
        throw new Error("No stations found!");
    }

    // prepare the writer for the service-wide file
    const serviceWriter = fs.createWriteStream(path.join(outputPath, `service_${serviceId}-${startDT.toFormat("yyyy-MM-dd")}_${endDT.toFormat("yyyy-MM-dd")}.csv`));
    serviceWriter.write(["timestamp", "service_id", "station_id", "station_longitude", "station_latitude", "vehicles_available", "boxes_available", "sunshine", "rain", "temperature", "holiday"].join(",") + "\r\n");

    for (const stationId of stations) {
        console.log(`Exporting station ${stationId} ...`);

        // we don't use any streaming yet, since we can control the
        // result set size by a smaller date range and limit the memory use thereby
        const records = await db.manyOrNone(`SELECT
                snp_timestamp,
                sta_ser_id,
                sta_id,
                sta_slug,
                sta_longitude,
                sta_latitude,
                snp_vehicles_available,
                snp_boxes_available,
                wet_sunshine,
                wet_rain,
                wet_temperature
            FROM
                smai_snapshot,
                smai_station,
                smai_weather
            WHERE
                sta_id = $1
                AND snp_sta_id = sta_id
                AND snp_timestamp >= $2
                AND snp_timestamp <  $3
                AND EXTRACT(MINUTE FROM snp_timestamp) IN (7, 24, 37, 52)
                AND snp_station_status = 'operational'
                AND date_trunc('hour', snp_timestamp) = date_trunc('hour', wet_timestamp)
                AND wet_synop_id = '11035'
            ORDER BY snp_timestamp ASC`,
            [ stationId, startDT.toJSDate(), endDT.plus({ days: 1 }).toJSDate() ]
        );

        if (records.length === 0) {
            console.warn(`No records found for station ${stationId}!`);
            continue;
        } else {
            console.log(`Writing ${records.length} records for ${stationId} ...`);
        }

        const stationWriter = fs.createWriteStream(path.join(outputPath, `service_${serviceId}-station_${stationId}_${records[0].sta_slug}-${startDT.toFormat("yyyy-MM-dd")}_${endDT.toFormat("yyyy-MM-dd")}.csv`));
        stationWriter.write(["timestamp", "service_id", "station_id", "station_longitude", "station_latitude", "vehicles_available", "boxes_available", "sunshine", "rain", "temperature", "holiday"].join(",") + "\r\n");
        for (const record of records) {
            const recordDate = DateTime.fromJSDate(record.snp_timestamp);
            const line = [
                recordDate.toUTC().toISO(),
                record.sta_ser_id,
                record.sta_id,
                record.sta_longitude,
                record.sta_latitude,
                record.snp_vehicles_available,
                record.snp_boxes_available,
                record.wet_sunshine,
                record.wet_rain,
                record.wet_temperature,
                HOLIDAYS.indexOf(recordDate.toFormat("dd.MM.yyyy")) >= 0 ? 1 : 0
            ].map(col => col === null ? "" : col).join(",") + "\r\n";
            stationWriter.write(line);
            serviceWriter.write(line);
        }
        stationWriter.end();
    }

    serviceWriter.end();
    db.$pool.end();
};

async function getStations(db, serviceId) {
    const stations = await db.manyOrNone("SELECT sta_id FROM smai_station WHERE sta_ser_id = $1", [
        serviceId
    ]);

    return stations.map(station => station["sta_id"]);
}
