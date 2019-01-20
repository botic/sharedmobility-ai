const fs = require("fs");

const tar = require("tar-stream");
const gunzip = require("gunzip-maybe");
const concat = require("concat-stream");

const logger = require("../../logging");

module.exports = async function(stations, inputFile) {
    return new Promise((resolve, reject) => {
        let coverage = 0;
        const existingStationKeys = stations
            .map(station => `${station.id} - ${station.name} <${station.longitude},${station.latitude}>`)
            .sort((a, b) => a.localeCompare(b));

        // decrements the coverage detector variable by one,
        // negative coverage => not all stations are included in every snapshot
        function decreaseCoverage() {
            if (coverage > Number.MIN_SAFE_INTEGER) {
                coverage --;
            }
        }

        try {
            const stream = fs.createReadStream(inputFile);
            stream.pipe(gunzip()).pipe(tar.extract())
                .on("entry", function (header, stream, next) {
                    stream.pipe(concat((data) => {
                        try {
                            const obj = JSON.parse(data.toString());
                            if (Array.isArray(obj.stationlist) && obj.stationlist.length > 0) {
                                if (stations.length !== obj.stationlist.length) {
                                    logger.error(`File ${header.name} does not contain all stations. It has ${obj.stationlist.length} instead of ${stations.length}!`);
                                    decreaseCoverage();
                                } else {
                                    const fileStationKeys = [];
                                    for (const station of obj.stationlist) {
                                        fileStationKeys.push(`${station.id} - ${station.name} <${station.location.x},${station.location.y}>`);
                                    }

                                    if (fileStationKeys
                                        .sort((a, b) => a.localeCompare(b))
                                        .map((fileStationKey, index) => existingStationKeys[index] === fileStationKey)
                                        .some(validKey => validKey !== true)
                                    ) {
                                        logger.error(`File ${header.name} does not contain the same stations!`);
                                        decreaseCoverage();
                                    }
                                }
                            }
                        } catch (e) {
                            logger.warn(`Could not parse ${header.name} with size ${header.size};\n${data.toString()}`, e);
                        } finally {
                            next();
                        }
                    }));
                })
                .on("finish", () => {
                    resolve(coverage);
                });
        } catch (e) {
            reject(e);
        }
    });
};