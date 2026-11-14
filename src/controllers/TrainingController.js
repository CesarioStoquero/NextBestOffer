import { AppEvent } from '../events/appEvents.js';

export class TrainingController {
    constructor({ view, recommender, customerService, productService, events }) {
        this.view = view;
        this.recommender = recommender;
        this.customerService = customerService;
        this.productService = productService;
        this.events = events;
    }

    start() {
        this.recommender.onProgress(progress => this.view.renderProgress(progress));
        this.recommender.onTrained(result => this.#completeTraining(result));
        this.view.onRetrain(() => this.train());
        this.events.on(AppEvent.productContracted, () => this.view.renderStale());
        this.train();
    }

    train() {
        this.view.renderStarted();
        this.events.emit(AppEvent.trainingRequested);
        this.recommender.train(this.customerService.list(), this.productService.list());
    }

    #completeTraining(result) {
        this.view.renderTrained(result);
        this.events.emit(AppEvent.modelTrained);
    }
}
