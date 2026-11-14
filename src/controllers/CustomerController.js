import { AppEvent } from '../events/appEvents.js';

export class CustomerController {
    constructor({ view, customerService, productService, events }) {
        this.view = view;
        this.customerService = customerService;
        this.productService = productService;
        this.events = events;
    }

    start() {
        this.view.renderOptions(this.customerService.list());
        this.view.onSelect(id => this.select(id));
        this.events.on(AppEvent.productContracted, ({ customerId }) => this.select(customerId));
        this.select(this.view.selectedId());
    }

    select(customerId) {
        const customer = this.customerService.find(customerId);
        this.view.renderProfile(customer, this.productService.findMany(customer.productIds));
        this.events.emit(AppEvent.customerSelected, customer);
    }
}
