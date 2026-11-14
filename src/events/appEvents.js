export const AppEvent = Object.freeze({
    customerSelected: 'customer:selected',
    productContracted: 'product:contracted',
    trainingRequested: 'training:requested',
    trainingProgress: 'training:progress',
    modelTrained: 'model:trained',
});

export class EventBus {
    #target = new EventTarget();

    on(name, handler) {
        this.#target.addEventListener(name, event => handler(event.detail));
    }

    emit(name, detail) {
        this.#target.dispatchEvent(new CustomEvent(name, { detail }));
    }
}
