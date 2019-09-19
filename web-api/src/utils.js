const flat = require("array.prototype.flat");
const config = require("./config");

const HOLIDAYS = config.get("holidays");

exports.toInputArray = function(dt, rain, sunshine, temperature) {
    const holiday = HOLIDAYS.indexOf(dt.toFormat("dd.MM.yyyy")) >= 0 ? 1 : 0;

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

    const rainCategory = new Array(4).fill(0);
    if (rain >= 1) {
        rainCategory[0] = 1;
    }
    if (rain >= 2.5) {
        rainCategory[1] = 1;
    }
    if (rain >= 5) {
        rainCategory[2] = 1;
    }
    if (rain >= 9) {
        rainCategory[3] = 1;
    }

    const sunshineCategory = new Array(4).fill(0);
    if (sunshine >= 25) {
        sunshineCategory[0] = 1;
    }
    if (sunshine >= 50) {
        sunshineCategory[1] = 1;
    }
    if (sunshine >= 75) {
        sunshineCategory[2] = 1;
    }
    if (sunshine === 100) {
        sunshineCategory[3] = 1;
    }

    const temperatureCategory = new Array(4).fill(0);
    if (temperature >= 15) {
        temperatureCategory[0] = 1;
    }
    if (temperature >= 20) {
        temperatureCategory[1] = 1;
    }
    if (temperature >= 25) {
        temperatureCategory[2] = 1;
    }
    if (temperature >= 30) {
        temperatureCategory[3] = 1;
    }

    return flat([
        holiday,
        dayCategory,
        hourCategory,
        minuteCategory,
        rainCategory,
        sunshineCategory,
        temperatureCategory
    ], 1);
};

const THRESHOLD = 0.8;
exports.humanReadableMessage = function(prediction) {
    if (prediction.filter(val => val >= THRESHOLD).length > 1) {
        return "indecisive";
    }

    const messages = [];

    if (prediction[0] >= THRESHOLD) {
        messages.push("full of bikes (> 80%)");

        if (prediction.slice(1).some(val => val >= 0.5)) {
            messages.push("very uncertain");
        } else if (prediction.slice(1).some(val => val >= 0.3)) {
            messages.push("uncertain");
        }
    } else if (prediction[1] >= THRESHOLD) {
        messages.push("bike count 50 % to 80 %");

        if (prediction.filter((val, index) => index !== 1).some(val => val >= 0.5)) {
            messages.push("very uncertain");
        } else if (prediction.filter((val, index) => index !== 1).some(val => val >= 0.3)) {
            messages.push("uncertain");
        }
    } else if (prediction[2] >= THRESHOLD) {
        messages.push("bike count 20 % to 50 %");

        if (prediction.filter((val, index) => index !== 2).some(val => val >= 0.5)) {
            messages.push("very uncertain");
        } else if (prediction.filter((val, index) => index !== 2).some(val => val >= 0.3)) {
            messages.push("uncertain");
        }
    } else if (prediction[3] >= THRESHOLD) {
        messages.push("bikes low (< 20%)");

        if (prediction.slice(0, 3).some(val => val >= 0.5)) {
            messages.push("very uncertain");
        } else if (prediction.slice(0, 3).some(val => val >= 0.3)) {
            messages.push("uncertain");
        }
    }

    return messages.join(", ");
};
