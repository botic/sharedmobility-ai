const fs = require("fs");

const tf = require(`@tensorflow/tfjs-node${process.env.TFJS_GPU === "supported" ? "-gpu" : ""}`);

const config = require("../../config");
const { convertCsvRecord } = require("./features");

const LEARNING_RATE = 0.001;
const LOSS = tf.losses.meanSquaredError;
const METRICS = "accuracy";

module.exports = async function(datasetURL, outputURL) {
    const INPUT_LENGTH = 48;

    const trainingSet = tf.data.csv(datasetURL.href).map(obj => convertCsvRecord(obj));

    const model = tf.sequential();

    // build the layered model
    model.add(tf.layers.dense({units: INPUT_LENGTH * 4, activation: "relu", inputShape: [INPUT_LENGTH]}));
    model.add(tf.layers.dense({units: 100, activation: "relu"}));
    //model.add(tf.layers.dense({units: 100, activation: "relu"}));
    model.add(tf.layers.dense({units: 4, activation: "softmax"}));

    // Compile model to prepare for training.
    model.compile({
        optimizer: tf.train.rmsprop(LEARNING_RATE),
        loss: LOSS,
        metrics: [METRICS]
    });

    const history = await model.fitDataset(trainingSet, {
        epochs: 50,
        batchSize: 512,
        shuffle: true
    });

    const loss = history.history.loss.slice(-1)[0];
    const acc = history.history.acc.slice(-1)[0];

    if (process.env.NODE_ENV !== "production") {
        console.log(`Model for ${datasetURL.pathname} => acc ${acc} | loss ${loss}`);
    }

    await model.save(
        new URL(`${outputURL.href}/smai_model_${datasetURL.pathname.replace(/[\\:.\/]/g, "_")}`).href
    );
};
