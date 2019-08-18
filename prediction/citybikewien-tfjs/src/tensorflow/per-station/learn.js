const fs = require("fs");
const tf = require("@tensorflow/tfjs-node");

const config = require("../../config");
const { convertSnapshot } = require("./features");

const LEARNING_RATE = 0.001;
const LOSS = tf.losses.meanSquaredError;
const METRICS = "accuracy";

module.exports = async function(inputCSV, outputDir) {
    for (const station of config.get("stations")) {
        await modelForStation(station, inputCSV, outputDir);
    }
};

async function modelForStation(stationId, trainingCsvURL, outputDirUrl) {
    const trainingData = tf.data.csv(trainingCsvURL.href);

    const converted = trainingData
        .filter(obj => obj.sta_id === stationId)
        .map(obj => convertSnapshot(obj));

    const model = tf.sequential();

    const INPUT_LENGTH = 12;

    // build the layered model
    model.add(tf.layers.dense({units: INPUT_LENGTH * 4, activation: "relu", inputShape: [INPUT_LENGTH]}));
    model.add(tf.layers.dense({units: 300, activation: "relu"}));
    //model.add(tf.layers.dense({units: 100, activation: "relu"}));
    model.add(tf.layers.dense({units: 4, activation: "softmax"}));

    // Compile model to prepare for training.
    model.compile({
        optimizer: tf.train.rmsprop(LEARNING_RATE),
        loss: LOSS,
        metrics: [METRICS]
    });

    const history = await model.fitDataset(converted, {
        epochs: 15,
        batchSize: 512,
        shuffle: true
    });

    const loss = history.history.loss.slice(-1)[0];
    const acc = history.history.acc.slice(-1)[0];

    if (process.env.NODE_ENV !== "production") {
        console.log(`Station ${stationId} => acc ${acc} | loss ${loss}`);
    }

    fs.appendFileSync(
        new URL(`${outputDirUrl.href}/performance-log.txt`),
        `Station ${stationId} => acc ${acc} | loss ${loss}\n${JSON.stringify(history.history, null, 2)}`
    );
    await model.save(new URL(`${outputDirUrl.href}/smai_model_${stationId}`).href);
}
