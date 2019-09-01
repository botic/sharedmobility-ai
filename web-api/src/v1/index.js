const config = require("../config");

const express = require("express");
const { param, validationResult } = require("express-validator");

const app = module.exports = express();

const { Storage } = require("@google-cloud/storage");

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


    const prefix = `tfjs-models/service_${req.params.service}/station_${req.params.station}/`;

    const storage = new Storage();
    const [files] = await storage.bucket(config.get("storage:bucket")).getFiles({
        prefix
    });

    res.status(200).send(files.map(f => f.name).filter(name => name !== prefix && name.endsWith("/")));
});
