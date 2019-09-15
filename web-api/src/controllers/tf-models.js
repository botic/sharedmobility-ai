const config = require("../config");

const tf = require("@tensorflow/tfjs-node");
const { Storage } = require("@google-cloud/storage");

const LRU = require("lru-cache");
const modelCache = new LRU(config.get("cache:models"));

exports.listModels = async function listModels(service, station) {
    const prefix = `service_${service}/station_${station}/`;

    const storage = new Storage();
    const [files] = await storage.bucket(config.get("storage:bucket")).getFiles({
        prefix
    });

    const folders = new Set(files
        .map(f => f.name)
        .filter(name => name !== prefix && !name.endsWith("/"))
        .map(name => name.match(/\/station_\d+\/([^/]+)/)[1]));

    return [...folders];
};

exports.getModel = async function getModel(service, station, model) {
    const modelKey = `${service}_${station}_${model}`;

    const cachedModel = modelCache.get(modelKey);
    if (cachedModel) {
        return cachedModel;
    }

    const filePath = `service_${service}/station_${station}/${model}/model.json`;

    const storage = new Storage();
    const bucket = storage.bucket(config.get("storage:bucket"));
    const file = bucket.file(filePath);

    const exists = (await file.exists())[0];
    if (!exists) {
        console.error(`File ${filePath} not found in bucket ${config.get("storage:bucket")}`);
        return null;
    }

    const isPublic = (await file.isPublic())[0];
    if (!isPublic) {
        console.error(`Access private file ${filePath} in bucket ${config.get("storage:bucket")}`);
        return null;
    }

    const publicURL = `https://storage.googleapis.com/${config.get("storage:bucket")}/${filePath}`;
    try {
        const tfModel = await tf.loadLayersModel(publicURL);

        modelCache.set(modelKey, tfModel);
        console.log(`Cached model with key ${modelKey}`);

        return tfModel;
    } catch (e) {
        console.error(e);
        return null;
    }
};
