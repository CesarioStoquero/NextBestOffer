export class CustomerService {
    #customers = [];

    async load() {
        this.#customers = await (await fetch('./data/customers.json')).json();
        return this.#customers;
    }

    list() {
        return this.#customers;
    }

    find(id) {
        return this.#customers.find(c => c.id === id);
    }

    contract(customerId, productId) {
        this.#customers = this.#customers.map(c =>
            c.id === customerId ? { ...c, productIds: [...c.productIds, productId] } : c);
        return this.find(customerId);
    }
}
