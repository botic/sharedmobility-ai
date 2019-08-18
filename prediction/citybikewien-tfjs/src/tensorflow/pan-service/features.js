const tf = require("@tensorflow/tfjs-node");
const flat = require("array.prototype.flat");
const { DateTime } = require("luxon");
const {
    getDistance,
    isPointInPolygon
} = require("geolib");

const {
    CITYBIKEWIEN_TIMEZONE,
    VIENNA_STEPHANSDOM,
    VIENNA_POLYGON_CENTER,
    VIENNA_POLYGON_NORTH,
    VIENNA_POLYGON_SOUTH,
    VIENNA_POLYGON_EAST
} = require("../../constants");

exports.convertSnapshot =  function(snapshot) {
    return {
        xs: tf.tensor2d([snapshotToInput(snapshot)]),
        ys: tf.tensor2d([snapshotToOutput(snapshot)])
    }
};

const snapshotToInput = exports.snapshotToInput = function snapshotToInput(snapshot) {
    const dt = DateTime.fromSQL(snapshot.snp_timestamp, { zone: CITYBIKEWIEN_TIMEZONE }).toUTC();

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

    const snapshotCoordinates = {
        latitude: snapshot.sta_latitude,
        longitude: snapshot.sta_longitude
    };

    return flat([
        Math.floor(getDistance(snapshotCoordinates, VIENNA_STEPHANSDOM) / 250),
        isPointInPolygon(snapshotCoordinates, VIENNA_POLYGON_CENTER) ? 1 : 0,
        isPointInPolygon(snapshotCoordinates, VIENNA_POLYGON_NORTH) ? 1 : 0,
        isPointInPolygon(snapshotCoordinates, VIENNA_POLYGON_EAST) ? 1 : 0,
        isPointInPolygon(snapshotCoordinates, VIENNA_POLYGON_SOUTH) ? 1 : 0,
        dayCategory,
        hourCategory,
        minuteCategory
    ], 1);
};

const snapshotToOutput = exports.snapshotToOutput = function snapshotToOutput(snapshot) {
    const load = snapshot.snp_vehicles_available / (snapshot.snp_vehicles_available + snapshot.snp_boxes_available);
    return [
        load > 0.8 ? 1 : 0, // full of bikes
        load > 0.5 && load <= 0.8 ? 1 : 0,
        load > 0.2 && load <= 0.5 ? 1 : 0,
        load <= 0.2 ? 1 : 0 // very low load
    ];
};