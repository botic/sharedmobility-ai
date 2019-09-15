const config = require("../config");

const axios = require("axios");
const LRU = require("lru-cache");
const weatherCache = new LRU(config.get("cache:weather"));

exports.currentWeather = async function currentWeather(synop) {
    // check if weather data already has been cached
    const cachedEntry = weatherCache.get(synop);
    if (cachedEntry) {
        return cachedEntry;
    }

    // if weather data is not available, use default values
    // this value could be improved if we take the seasonal changes into account,
    // but we keep it simple for the first stage since ZAMG data should be available most of the time
    const weather = {
        rain: 0,
        sunshine: 50,
        temperature: 25
    };

    try {
        const zamgTawes = await axios.get(config.get("zamg:ogd"));
        if (zamgTawes.status !== 200) {
            console.warn(`Could not read weather data, got status ${zamgTawes.status}.`);
            return weather;
        }

        const zamgData = zamgTawes.data
            .replace(/\r\n/g, "\n")
            .split("\n")
            .filter(line => line !== "")
            .map(line => line.split(";")
                .map(cell => cell.replace(/^"/, "").replace(/"$/, ""))
            );

        // normalize the headers
        const headers = zamgData[0].map(header => header.toLowerCase());

        // get the column indices of all relevant measurements
        const tempIndex = headers.findIndex(val => val === "t °c");
        const rainIndex = headers.findIndex(val => val === "n l/m²");
        const sunIndex = headers.findIndex(val => val === "so %");

        // find the station by its synop id and parse the line
        const line = zamgData.find(line => line[0] === synop);
        let temperature = Number.parseFloat(line[tempIndex].replace(",", "."));
        let sunshine = Number.parseInt(line[sunIndex]);
        let rain = Number.parseFloat(line[rainIndex].replace(",", "."));

        // security check if every value is valid
        let allowsCaching = true;

        // rain must be positive
        if (isNaN(rain) || rain < 0) {
            rain = 0;
            allowsCaching = false;
        }

        // sunshine is a percentage between 0 and 100
        if (isNaN(sunshine) || sunshine < 0 || sunshine > 100) {
            sunshine = 50;
            allowsCaching = false;
        }

        // more extreme temperatures are not possible in the cities we support at the moment
        if (isNaN(temperature) || temperature < -30 || temperature > 50) {
            temperature = 25;
            allowsCaching = false;
        }

        weather.rain = rain;
        weather.sunshine = sunshine;
        weather.temperature = temperature;

        if (allowsCaching) {
            console.log(`Updating weather cache for ${synop}`);
            weatherCache.set(synop, weather);
        }
    } catch (e) {
        console.error(e);
    }

    return weather;
};
