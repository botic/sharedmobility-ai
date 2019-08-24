const tf = require("@tensorflow/tfjs-node");
const flat = require("array.prototype.flat");
const { DateTime } = require("luxon");

const { CITYBIKEWIEN_TIMEZONE } = require("../../constants");

exports.convertCsvRecord =  function(record) {
    return {
        xs: tf.tensor2d([recordToInput(record)]),
        ys: tf.tensor2d([recordToOutput(record)])
    }
};

function recordToInput(record) {
    const dt = DateTime.fromISO(record.timestamp, { zone: CITYBIKEWIEN_TIMEZONE }).toUTC();

    const dayCategory = new Array(7).fill(0);
    dayCategory[dt.weekday - 1] = 1;

    const hourCategory = new Array(24).fill(0);
    hourCategory[dt.hour] = 1;

    const minuteCategory = new Array(4).fill(0);
    if (dt.minute >= 0 && dt.minute < 15) {
        minuteCategory[0] = 1;
    } else if (dt.minute >= 15 && dt.minute < 30) {
        minuteCategory[1] = 1;
    } else if (dt.minute >= 30 && dt.minute < 45) {
        minuteCategory[2] = 1;
    } else if (dt.minute >= 45 && dt.minute < 60) {
        minuteCategory[3] = 1;
    }

    // weather-based data
    //record.sunshine,
    //record.rain,
    //record.temperature

    const rainCategory = new Array(4).fill(0);
    if (record.rain >= 1) {
        rainCategory[0] = 1;
    }
    if (record.rain >= 2.5) {
        rainCategory[1] = 1;
    }
    if (record.rain >= 5) {
        rainCategory[2] = 1;
    }
    if (record.rain >= 9) {
        rainCategory[3] = 1;
    }

    const sunshineCategory = new Array(4).fill(0);
    if (record.sunshine >= 25) {
        sunshineCategory[0] = 1;
    }
    if (record.sunshine >= 50) {
        sunshineCategory[1] = 1;
    }
    if (record.sunshine >= 75) {
        sunshineCategory[2] = 1;
    }
    if (record.sunshine === 100) {
        sunshineCategory[3] = 1;
    }

    const temperatureCategory = new Array(4).fill(0);
    if (record.temperature >= 15) {
        temperatureCategory[0] = 1;
    }
    if (record.temperature >= 20) {
        temperatureCategory[1] = 1;
    }
    if (record.temperature >= 25) {
        temperatureCategory[2] = 1;
    }
    if (record.temperature >= 30) {
        temperatureCategory[3] = 1;
    }

    return flat([
        record.holiday,
        dayCategory,
        hourCategory,
        minuteCategory,
        rainCategory,
        sunshineCategory,
        temperatureCategory
    ], 1);
}

function recordToOutput(record) {
    const load = record.vehicles_available / (record.vehicles_available + record.boxes_available);

    return [
        load > 0.8 ? 1 : 0, // full of bikes
        load > 0.5 && load <= 0.8 ? 1 : 0,
        load > 0.2 && load <= 0.5 ? 1 : 0,
        load <= 0.2 ? 1 : 0 // very low load
    ];
}