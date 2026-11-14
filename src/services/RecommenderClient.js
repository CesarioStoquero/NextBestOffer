import { WorkerMessage } from '../events/workerMessages.js';

export class RecommenderClient {
    #worker;
    #pending = new Map();
    #onProgress = () => {};
    #onTrained = () => {};

    constructor(worker) {
        this.#worker = worker;
        this.#worker.onmessage = ({ data }) => this.#route(data);
    }

    onProgress(handler) {
        this.#onProgress = handler;
    }

    onTrained(handler) {
        this.#onTrained = handler;
    }

    train(customers, products) {
        this.#worker.postMessage({ type: WorkerMessage.train, customers, products });
    }

    recommend(customer, candidates) {
        return new Promise(resolve => {
            this.#pending.set(customer.id, resolve);
            this.#worker.postMessage({ type: WorkerMessage.recommend, customer, candidates });
        });
    }

    #route(message) {
        const routes = {
            [WorkerMessage.progress]: () => this.#onProgress(message),
            [WorkerMessage.trained]: () => this.#onTrained(message),
            [WorkerMessage.recommendations]: () => this.#resolve(message),
        };
        routes[message.type]?.();
    }

    #resolve({ customerId, items }) {
        this.#pending.get(customerId)?.(items);
        this.#pending.delete(customerId);
    }
}
