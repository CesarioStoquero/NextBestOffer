import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildFeatureSpace, buildTrainingSet } from '../src/ml/featureSpace.js';

const products = [
    { id: 'cc', category: 'cartao', risk: 1, monthlyFee: 20, minimumMonthlyIncome: 0 },
    { id: 'acoes', category: 'investimento', risk: 3, monthlyFee: 0, minimumMonthlyIncome: 0 },
];
const customers = [
    { id: 1, age: 20, monthlyIncome: 2000, riskProfile: 1, productIds: ['cc'] },
    { id: 2, age: 60, monthlyIncome: 20000, riskProfile: 3, productIds: ['acoes'] },
    { id: 3, age: 40, monthlyIncome: 6000, riskProfile: 2, productIds: [] },
];
const space = buildFeatureSpace(customers, products);

test('categoria vira one-hot com o peso de 0.4 na posição certa', () => {
    assert.deepEqual(space.encodeProduct(products[1]).slice(0, 5), [0, 0.4, 0, 0, 0]);
});

test('cliente com produtos herda a carteira e o próprio perfil', () => {
    const vector = space.encodeCustomer(customers[0]);
    assert.deepEqual(vector.slice(0, 8), space.encodeProduct(products[0]));
    assert.deepEqual(vector.slice(-3), [0, 0, 0]);
});

test('cliente sem produtos (cold start) tem carteira zerada', () => {
    const vector = space.encodeCustomer(customers[2]);
    assert.ok(vector.slice(0, 8).every(v => v === 0));
    assert.equal(vector.at(-1), 0.5);
});

test('treino usa só clientes com produtos, um par por produto', () => {
    const { inputs, labels } = buildTrainingSet(space, customers, products);
    assert.equal(inputs.length, 4);
    assert.deepEqual(labels, [1, 0, 0, 1]);
    assert.ok(inputs.every(i => i.length === space.inputSize));
});
