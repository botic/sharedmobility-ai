const fs = require("fs");

const tar = require("tar-stream");
const gunzip = require("gunzip-maybe");
const concat = require("concat-stream");

const logger = require("../../../logging");

/**
 * Finds and collects all distinct stations inside the tar.gz archive.
 * @param {string} inputFile path to the compressed input archive
 * @return {Promise<any>} promise resolves with all found stations
 */
module.exports = async function(inputFile) {
    // contains all found stations from the raw snapshots
    const stationCollection = Object.create({});

    return new Promise((resolve, reject) => {
        try {
            const stream = fs.createReadStream(inputFile);
            stream.pipe(gunzip()).pipe(tar.extract())
                .on("entry", function (header, stream, next) {
                    if (header.size === 0) {
                        return next();
                    }

                    stream.pipe(concat((data) => {
                        try {
                            const obj = JSON.parse(data.toString());
                            if (Array.isArray(obj.stationlist) && obj.stationlist.length > 0) {
                                for (const station of obj.stationlist) {
                                    const stationKey = `${station.id} - ${station.name} <${station.location.x},${station.location.y}>`;
                                    if (stationCollection[stationKey] === undefined) {
                                        stationCollection[stationKey] = {
                                            id: station.id,
                                            name: station.name,
                                            latitude: station.location.y,
                                            longitude: station.location.x,
                                            address: `${station.address.streetAddress}, ${station.address.zipCode} ${station.address.city}`
                                        };
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
                    resolve(Object.values(stationCollection));
                });
        } catch (e) {
            reject(e);
        }
    });
};