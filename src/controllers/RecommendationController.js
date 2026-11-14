import { AppEvent } from '../events/appEvents.js';
import { splitByEligibility } from '../domain/eligibility.js';
import { rankByPopularity } from '../ml/popularity.js';

const TOP_OFFERS = 3;

export class RecommendationController {
    #customer = null;
    #modelReady = false;

    constructor({ view, recommender, customerService, productService, events }) {
        this.view = view;
        this.recommender = recommender;
        this.customerService = customerService;
        this.productService = productService;
        this.events = events;
    }

    start() {
        this.view.onContract(productId => this.#contract(productId));
        this.events.on(AppEvent.customerSelected, customer => this.#show(customer));
        this.events.on(AppEvent.trainingRequested, () => { this.#modelReady = false; });
        this.events.on(AppEvent.modelTrained, () => {
            this.#modelReady = true;
            this.#show(this.#customer);
        });
    }

    async #show(customer) {
        if (!customer) {
            return;
        }

        this.#customer = customer;
        const { eligible, blocked } = splitByEligibility(customer, this.productService.list());
        this.view.renderBlocked(blocked);

        if (customer.productIds.length === 0) {
            const offers = rankByPopularity(eligible, this.customerService.list(), TOP_OFFERS);
            this.view.renderRecommendations(offers, 'Cold start: cliente sem histórico, ofertas mais populares entre os elegíveis');
            return;
        }

        if (!this.#modelReady) {
            this.view.renderWaiting();
            return;
        }

        const ranked = await this.recommender.recommend(customer, eligible);

        if (this.#customer !== customer) {
            return;
        }

        this.view.renderRecommendations(ranked.slice(0, TOP_OFFERS), 'Rede neural (TensorFlow.js) ordenando só os produtos elegíveis');
    }

    #contract(productId) {
        const customer = this.customerService.contract(this.#customer.id, productId);
        this.events.emit(AppEvent.productContracted, { customerId: customer.id, productId });
    }
}
