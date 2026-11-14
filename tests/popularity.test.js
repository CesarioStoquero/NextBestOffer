import { test } from 'node:test';
import assert from 'node:assert/strict';
import { rankByPopularity } from '../src/ml/popularity.js';

test('cold start ordena pelos mais contratados e desempata pela menor tarifa', () => {
    const candidates = [
        { id: 'a', monthlyFee: 10 },
        { id: 'b', monthlyFee: 0 },
        { id: 'c', monthlyFee: 5 },
    ];
    const customers = [{ productIds: ['a', 'b'] }, { productIds: ['a'] }, { productIds: ['c'] }];
    assert.deepEqual(rankByPopularity(candidates, customers, 3).map(r => r.product.id), ['a', 'b', 'c']);
});
