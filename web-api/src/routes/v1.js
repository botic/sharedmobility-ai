const config = require("../config");

const { DateTime } = require("luxon");
const tf = require("@tensorflow/tfjs-node");

// be aware: these controllers use caching to get faster responses
const { getModel, listModels } = require("../controllers/tf-models");
const { currentWeather } = require("../controllers/weather");

const { toInputArray, humanReadableMessage } = require("../utils");

const express = require("express");
const { param, query, validationResult } = require("express-validator");
const app = module.exports = express();

// configure express to be less noisy
app.set("etag", false); // we don't need etags ...
app.set("json spaces", 2); // easier to read output instead of saving some bytes
app.set("x-powered-by", false); // nobody needs this header

/**
 * Test action, returns the current API version.
 */
app.get("/", (req, res) => res.status(200).send({
    "status": "okay",
    "api": "SharedMobility.ai Web API V1"
}));

/**
 * Lists all available models for a station.
 */
app.get("/models/:service/:station", [
    param("service").isInt({ min: 1, max: config.get("smai:maxServiceId") }),
    param("station").isInt({ min: 1, max: config.get("smai:maxStationId") })
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        res.status(200).json(await listModels(req.params.service, req.params.station));
    } catch (e) {
        console.error(e);
        return res.status(500).json({ errors: [{ msg: `Internal Server Error.` }] });
    }
});

/**
 * Returns the summary for the given model.
 */
app.get("/models/:service/:station/:model/summary", [
    param("service").isInt({ min: 1, max: config.get("smai:maxServiceId") }),
    param("station").isInt({ min: 1, max: config.get("smai:maxStationId") }),
    param("model").isString().matches(/[\w_-]{1,255}/i),
    query("format").optional().isString().isIn(["json", "text"])
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const model = await getModel(req.params.service, req.params.station, req.params.model);

        if (model === null) {
            return res.status(400).json({ errors: [{ msg: `Model not found.` }] });
        } else {
            const summary = [];
            model.summary(80, [0.45, 0.85, 1], line => summary.push(line));

            if (req.query.format === "text") {
                res.set("Content-Type", "text/plain");
                return res.status(200).send(summary.join("\r\n"));
            } else {
                return res.status(200).json({
                    summary: summary.join("\n")
                });
            }
        }
    } catch (e) {
        console.error(e);
        return res.status(500).json({ errors: [{ msg: `Internal Server Error.` }] });
    }
});

/**
 * Returns a set of predictions for the current time and for the next 60 minutes.
 */
app.get("/predict/:service/:station", [
    param("service").isInt({ min: 1, max: config.get("smai:maxServiceId") }),
    param("station").isInt({ min: 1, max: config.get("smai:maxStationId") }),
    query("model").optional().isString().matches(/[\w_-]{1,255}/i)
], async (req, res) => {
    // prevent all client-side caching for the predictions
    res.set("Cache-Control", "no-cache, no-store, must-revalidate");
    res.set("Pragma", "no-cache");
    res.set("Expires", "0");

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({errors: errors.array()});
    }

    try {
        // look up the nearest synop weather station in the config, defaults to "Hohe Warte" in Vienna
        const synop = config.get("zamg:synop")["service" + req.params.service] || "11035";
        const {rain, sunshine, temperature } = await currentWeather(synop);

        const modelName = req.query.model || "best";
        const model = await getModel(req.params.service, req.params.station, modelName);

        const dt = DateTime.utc();
        const prediction2d = await model.predict(tf.tensor2d([
            toInputArray(dt,rain, sunshine, temperature),
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
