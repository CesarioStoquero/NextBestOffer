export class ProductService {
    #products = [];

    async load() {
        this.#products = await (await fetch('./data/products.json')).json();
        return this.#products;
    }

    list() {
        return this.#products;
    }

    findMany(ids) {
        return this.#products.filter(p => ids.includes(p.id));
    }
}
