const config = require("../config");

const axios = require("axios");
const { DateTime } = require("luxon");
const tf = require("@tensorflow/tfjs-node");
const { Storage } = require("@google-cloud/storage");

const express = require("express");
const { param, query, validationResult } = require("express-validator");
const app = module.exports = express();

const {
    toInputArray,
    humanReadableMessage
} = require("../utils");

app.get("/", (req, res) => res.status(200).send({
    "status": "okay",
    "api": "SharedMobility.ai Web API V1"
}));

app.get("/models/:service/:station", [
    param("service").isInt({ min: 1, max: config.get("smai:maxServiceId") }),
    param("station").isInt({ min: 1, max: config.get("smai:maxStationId") })
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const prefix = `service_${req.params.service}/station_${req.params.station}/`;

    const storage = new Storage();
    const [files] = await storage.bucket(config.get("storage:bucket")).getFiles({
        prefix
    });

    const folders = new Set(files
        .map(f => f.name)
        .filter(name => name !== prefix && !name.endsWith("/"))
        .map(name => name.match(/\/station_\d+\/([^/]+)/)[1]));

    res.status(200).send([...folders]);
});

app.get("/models/:service/:station/:model/summary", [
    param("service").isInt({ min: 1, max: config.get("smai:maxServiceId") }),
    param("station").isInt({ min: 1, max: config.get("smai:maxStationId") }),
    param("model").isString().matches(/[\w_-]{1,255}/i)
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const filePath = `service_${req.params.service}/station_${req.params.station}/${req.params.model}/model.json`;

    const storage = new Storage();
    const bucket = storage.bucket(config.get("storage:bucket"));
    const file = bucket.file(filePath);

    const exists = (await file.exists())[0];
    if (!exists) {
        return res.status(404).json({ errors: [{ msg: `Not found: ${req.params.model}` }] });
    }

    const isPublic = (await file.isPublic())[0];
    if (!isPublic) {
        return res.status(403).json({ errors: [{ msg: `Forbidden.` }] });
    }

    const publicURL = `https://storage.googleapis.com/${config.get("storage:bucket")}/${filePath}`;
    try {
        const model = await tf.loadLayersModel(publicURL);

        const summary = [];
        model.summary(80, [0.45, 0.85, 1], line => summary.push(line));

        res.set("Content-Type", "text/plain");
        return res.status(200).send(summary.join("\r\n"));
    } catch (e) {
        console.error(e);
        return res.status(500).json({ errors: [{ msg: `Internal Server Error.` }] });
    }
});

app.get("/predict/:service/:station", [
    param("service").isInt({ min: 1, max: config.get("smai:maxServiceId") }),
    param("station").isInt({ min: 1, max: config.get("smai:maxStationId") }),
    query("model").optional().isString().matches(/[\w_-]{1,255}/i)
], async (req, res) => {
    res.set("Cache-Control", "no-cache, no-store, must-revalidate");
    res.set("Pragma", "no-cache");
    res.set("Expires", "0");

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({errors: errors.array()});
    }

    const modelName = req.query.model || "best";
    const filePath = `service_${req.params.service}/station_${req.params.station}/${modelName}/model.json`;

    const storage = new Storage();
    const bucket = storage.bucket(config.get("storage:bucket"));
    const file = bucket.file(filePath);

    const exists = (await file.exists())[0];
    if (!exists) {
        return res.status(404).json({ errors: [{ msg: `Not found: ${modelName}` }] });
    }

    const isPublic = (await file.isPublic())[0];
    if (!isPublic) {
        return res.status(403).json({ errors: [{ msg: `Forbidden.` }] });
    }

    let rain = 0,
        sunshine = 50,
        temperature = 25;

    try {
        const zamgTawes = await axios.get(config.get("zamg:ogd"));
        if (zamgTawes.status === 200) {
            const zamgData = zamgTawes.data
                .replace(/\r\n/g, "\n")
                .split("\n")
                .filter(line => line !== "")
                .map(line => line.split(";")
                    .map(cell => cell.replace(/^"/, "").replace(/"$/, ""))
                );

            const synop = config.get("zamg:synop")["service" + req.params.service];
            if (synop) {
                const headers = zamgData[0].map(header => header.toLowerCase());

                const tempIndex = headers.findIndex(val => val === "t °c");
                const rainIndex = headers.findIndex(val => val === "n l/m²");
                const sunIndex = headers.findIndex(val => val === "so %");

                const line = zamgData.find(line => line[0] === synop);
                temperature = Number.parseFloat(line[tempIndex].replace(",", "."));
                sunshine = Number.parseInt(line[sunIndex]);
                rain = Number.parseFloat(line[rainIndex].replace(",", "."));

                if (isNaN(rain)) {
                    rain = 0;
                }

                if (isNaN(sunshine)) {
                    sunshine = 50;
                }

                if (isNaN(temperature)) {
                    temperature = 25;
                }
            } else {
                console.warn("No synop mapping found for service " + req.params.service);
            }
        }
    } catch (e) {
        console.error(e);
        return res.status(500).json({ errors: [{ msg: `Weather data not available!` }] });
    }

    const publicURL = `https://storage.googleapis.com/${config.get("storage:bucket")}/${filePath}`;
    try {
        const model = await tf.loadLayersModel(publicURL);

        const dt = DateTime.utc();
        const prediction2d = await model.predict(tf.tensor2d([
            toInputArray(dt, 0, 100, 20),
            toInputArray(dt.plus({ minutes: 15 } ), rain, sunshine, temperature),
            toInputArray(dt.plus({ minutes: 30 } ), rain, sunshine, temperature),
            toInputArray(dt.plus({ minutes: 45 } ), rain, sunshine, temperature),
            toInputArray(dt.plus({ minutes: 60 } ), rain, sunshine, temperature),
        ]));
        const predictions = await prediction2d.array();
        return res.status(200).json({
            context: { timestamp: dt.toISO(), rain, sunshine, temperature },
            predictions: predictions.map((prediction, index) => {
                return {
                    timestamp: dt.plus({ minutes: 15 * index }).toISO(),
                    message: humanReadableMessage(prediction),
                    prediction
                }
            })
        });
    } catch (e) {
        console.error(e);
        return res.status(500).json({ errors: [{ msg: `Internal Server Error.` }] });
    }
});
