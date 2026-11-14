import { test } from 'node:test';
import assert from 'node:assert/strict';
import { evaluateEligibility, splitByEligibility } from '../src/domain/eligibility.js';
import { RiskProfile } from '../src/domain/riskProfile.js';

const customer = { id: 1, age: 30, monthlyIncome: 5000, riskProfile: RiskProfile.moderate, productIds: ['cc-gold'] };
const product = overrides => ({ id: 'p', category: 'investimento', risk: 1, monthlyFee: 0, minimumMonthlyIncome: 0, ...overrides });

test('produto dentro do perfil e da renda é elegível', () => {
    assert.equal(evaluateEligibility(customer, product()).eligible, true);
});

test('produto com risco acima do perfil viola suitability', () => {
    const result = evaluateEligibility(customer, product({ risk: RiskProfile.aggressive }));
    assert.deepEqual(result.violations.map(v => v.code), ['unsuitable-risk']);
});

test('renda abaixo do mínimo bloqueia o produto', () => {
    const result = evaluateEligibility(customer, product({ minimumMonthlyIncome: 15000 }));
    assert.deepEqual(result.violations.map(v => v.code), ['insufficient-income']);
});

test('produto já contratado não é oferecido de novo', () => {
    const result = evaluateEligibility(customer, product({ id: 'cc-gold' }));
    assert.deepEqual(result.violations.map(v => v.code), ['already-owned']);
});

test('separa elegíveis de bloqueados e esconde os já contratados', () => {
    const products = [product({ id: 'ok' }), product({ id: 'cc-gold' }), product({ id: 'arrojado', risk: 3 })];
    const { eligible, blocked } = splitByEligibility(customer, products);
    assert.deepEqual(eligible.map(p => p.id), ['ok']);
    assert.deepEqual(blocked.map(b => b.product.id), ['arrojado']);
});
