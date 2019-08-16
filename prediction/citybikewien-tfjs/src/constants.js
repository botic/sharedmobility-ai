// constants from the postgres enum
exports.STATION_OPERATIONAL = "operational";
exports.STATION_OUTAGE      = "outage";
exports.STATION_UNKNOWN     = "unknown";

// SeestadtFLOTTE constants
exports.SEESTADTFLOTTE_SERVICE_SLUG = "seestadtflotte";
exports.SEESTADTFLOTTE_STATION_PREFIX = "seestadt-";
exports.SEESTADTFLOTTE_TIMEZONE = "Europe/Vienna";

// Citybike Wien constants
exports.CITYBIKEWIEN_SERVICE_SLUG = "citybikewien";
exports.CITYBIKEWIEN_STATION_PREFIX = "citybikewien-";
exports.CITYBIKEWIEN_TIMEZONE = "Europe/Vienna";

// Boundaries
exports.VIENNA_STEPHANSDOM = {
    latitude: 48.208454,
    longitude: 16.373199
};
exports.VIENNA_POLYGON_CENTER = [
    { latitude: 48.21545, longitude: 16.36150 },
    { latitude: 48.21405, longitude: 16.35904 },
    { latitude: 48.20803, longitude: 16.35761 },
    { latitude: 48.20534, longitude: 16.35856 },
    { latitude: 48.20271, longitude: 16.36216 },
    { latitude: 48.20111, longitude: 16.36997 },
    { latitude: 48.20054, longitude: 16.37426 },
    { latitude: 48.20317, longitude: 16.37864 },
    { latitude: 48.20770, longitude: 16.38264 },
    { latitude: 48.21192, longitude: 16.38456 },
    { latitude: 48.21320, longitude: 16.37809 },
    { latitude: 48.21596, longitude: 16.37410 },
    { latitude: 48.21914, longitude: 16.36964 }
];
exports.VIENNA_POLYGON_NORTH = [
    { latitude: 48.21240, longitude: 16.37918 },
    { latitude: 48.21521, longitude: 16.37499 },
    { latitude: 48.21830, longitude: 16.37256 },
    { latitude: 48.22010, longitude: 16.36920 },
    { latitude: 48.22329, longitude: 16.36869 },
    { latitude: 48.22677, longitude: 16.36664 },
    { latitude: 48.22948, longitude: 16.36362 },
    { latitude: 48.23276, longitude: 16.36165 },
    { latitude: 48.23685, longitude: 16.36208 },
    { latitude: 48.25074, longitude: 16.37259 },
    { latitude: 48.25263, longitude: 16.37727 },
    { latitude: 48.26091, longitude: 16.39521 },
    { latitude: 48.26154, longitude: 16.42130 },
    { latitude: 48.25348, longitude: 16.47906 },
    { latitude: 48.24251, longitude: 16.51460 },
    { latitude: 48.23096, longitude: 16.52069 },
    { latitude: 48.21519, longitude: 16.51220 },
    { latitude: 48.19117, longitude: 16.47060 },
    { latitude: 48.19498, longitude: 16.41854 },
    { latitude: 48.19562, longitude: 16.41239 },
    { latitude: 48.20094, longitude: 16.40779 },
    { latitude: 48.20344, longitude: 16.39888 },
    { latitude: 48.20856, longitude: 16.39649 },
    { latitude: 48.21221, longitude: 16.39405 },
    { latitude: 48.21357, longitude: 16.38869 },
    { latitude: 48.21218, longitude: 16.38462 }
];
exports.VIENNA_POLYGON_EAST = [
    { latitude: 48.24118, longitude: 16.36333 },
    { latitude: 48.23415, longitude: 16.36061 },
    { latitude: 48.22985, longitude: 16.35576 },
    { latitude: 48.22550, longitude: 16.35163 },
    { latitude: 48.22055, longitude: 16.34892 },
    { latitude: 48.21850, longitude: 16.34508 },
    { latitude: 48.20992, longitude: 16.34165 },
    { latitude: 48.20580, longitude: 16.33907 },
    { latitude: 48.19939, longitude: 16.34010 },
    { latitude: 48.19437, longitude: 16.34230 },
    { latitude: 48.19138, longitude: 16.34027 },
    { latitude: 48.18671, longitude: 16.34523 },
    { latitude: 48.18326, longitude: 16.34869 },
    { latitude: 48.18226, longitude: 16.34370 },
    { latitude: 48.18189, longitude: 16.32204 },
    { latitude: 48.18507, longitude: 16.29904 },
    { latitude: 48.18679, longitude: 16.28647 },
    { latitude: 48.19104, longitude: 16.26406 },
    { latitude: 48.21175, longitude: 16.27934 },
    { latitude: 48.23245, longitude: 16.30646 },
    { latitude: 48.24571, longitude: 16.32380 }
];
exports.VIENNA_POLYGON_SOUTH = [
    { latitude: 48.18829, longitude: 16.34522 },
    { latitude: 48.19058, longitude: 16.35332 },
    { latitude: 48.19592, longitude: 16.35400 },
    { latitude: 48.20008, longitude: 16.36723 },
    { latitude: 48.19848, longitude: 16.37667 },
    { latitude: 48.20360, longitude: 16.38059 },
    { latitude: 48.21094, longitude: 16.38602 },
    { latitude: 48.21255, longitude: 16.38868 },
    { latitude: 48.21175, longitude: 16.39246 },
    { latitude: 48.20660, longitude: 16.39675 },
    { latitude: 48.20328, longitude: 16.39761 },
    { latitude: 48.20125, longitude: 16.40268 },
    { latitude: 48.19676, longitude: 16.40980 },
    { latitude: 48.19150, longitude: 16.41701 },
    { latitude: 48.18097, longitude: 16.40224 },
    { latitude: 48.17899, longitude: 16.38920 },
    { latitude: 48.17948, longitude: 16.36316 },
    { latitude: 48.18153, longitude: 16.35150 }
];