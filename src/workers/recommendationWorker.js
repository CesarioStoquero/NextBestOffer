import 'https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@4.22.0/dist/tf.min.js';
import { buildFeatureSpace, buildTrainingSet } from '../ml/featureSpace.js';
import { WorkerMessage } from '../events/workerMessages.js';

const EPOCHS = 30;
const BATCH_SIZE = 32;
const LEARNING_RATE = 0.01;

let model = null;
let space = null;

const handlers = {
    [WorkerMessage.train]: train,
    [WorkerMessage.recommend]: recommend,
};

self.onmessage = ({ data }) => handlers[data.type]?.(data);

async function train({ customers, products }) {
    space = buildFeatureSpace(customers, products);
    const { inputs, labels } = buildTrainingSet(space, customers, products);
    const xs = tf.tensor2d(inputs);
    const ys = tf.tensor2d(labels, [labels.length, 1]);

    model?.dispose();
    model = createModel(space.inputSize);

    await model.fit(xs, ys, {
        epochs: EPOCHS,
        batchSize: BATCH_SIZE,
        shuffle: true,
        callbacks: { onEpochEnd: (epoch, logs) => reportProgress(epoch, logs) },
    });

    tf.dispose([xs, ys]);
    self.postMessage({ type: WorkerMessage.trained, samples: labels.length });
}

function createModel(inputSize) {
    const network = tf.sequential();
    network.add(tf.layers.dense({ inputShape: [inputSize], units: 64, activation: 'relu' }));
    network.add(tf.layers.dense({ units: 32, activation: 'relu' }));
    network.add(tf.layers.dense({ units: 1, activation: 'sigmoid' }));
    network.compile({ optimizer: tf.train.adam(LEARNING_RATE), loss: 'binaryCrossentropy', metrics: ['accuracy'] });
    return network;
}

function reportProgress(epoch, logs) {
    self.postMessage({
        type: WorkerMessage.progress,
        epoch: epoch + 1,
        totalEpochs: EPOCHS,
        loss: logs.loss,
        accuracy: logs.acc,
    });
}

function recommend({ customer, candidates }) {
    const customerVector = space.encodeCustomer(customer);
    const scores = tf.tidy(() =>
        model.predict(tf.tensor2d(candidates.map(p => [...customerVector, ...space.encodeProduct(p)]))).dataSync());

    const items = candidates
        .map((product, i) => ({ product, score: scores[i] }))
        .sort((a, b) => b.score - a.score);

    self.postMessage({ type: WorkerMessage.recommendations, customerId: customer.id, items });
}
