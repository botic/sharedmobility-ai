const tf = require("@tensorflow/tfjs-node");

const {convertSnapshot} = require("../db/snapshots");

const LEARNING_RATE = 0.001;
const LOSS = tf.losses.meanSquaredError;
const METRICS = "accuracy";

module.exports = async function(trainingCsvURL, outputDirUrl) {
    const trainingData = tf.data.csv(trainingCsvURL.href);

    const converted = trainingData
        .shuffle(3000)
        .take(3000)
        .map(obj => convertSnapshot(obj));

    const model = tf.sequential();

    const INPUT_LENGTH = 40;

    // build the layered model
    model.add(tf.layers.dense({units: INPUT_LENGTH * 10, activation: "sigmoid", inputShape: [INPUT_LENGTH]}));
    model.add(tf.layers.dense({units: INPUT_LENGTH * 20, activation: "relu"}));
    model.add(tf.layers.dense({units: INPUT_LENGTH * 20, activation: "relu"}));
    model.add(tf.layers.dense({units: 4, activation: "softmax"}));

    if (process.env.NODE_ENV !== "production") {
        model.summary();
    }

    // Compile model to prepare for training.
    model.compile({
        optimizer: tf.train.adam(LEARNING_RATE),
        loss: LOSS,
        metrics: [METRICS]
    });

    const history = await model.fitDataset(converted, {
        epochs: 50,
        batchSize: 512,
        shuffle: true
    });

    const loss = history.history.loss.slice(-1)[0];
    const acc = history.history.acc.slice(-1)[0];

    await model.save(new URL(`${outputDirUrl.href}/model-lr_${LEARNING_RATE}-acc_${acc}-loss_${loss}.tfm`).href);
};
