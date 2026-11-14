import { riskLabel } from './riskProfile.js';

const notOwned = {
    code: 'already-owned',
    isSatisfiedBy: (customer, product) => !customer.productIds.includes(product.id),
    reason: () => 'Cliente já possui o produto',
};

const suitability = {
    code: 'unsuitable-risk',
    isSatisfiedBy: (customer, product) => product.risk <= customer.riskProfile,
    reason: (customer, product) =>
        `Risco ${riskLabel[product.risk]} acima do perfil ${riskLabel[customer.riskProfile]} (suitability)`,
};

const minimumIncome = {
    code: 'insufficient-income',
    isSatisfiedBy: (customer, product) => customer.monthlyIncome >= product.minimumMonthlyIncome,
    reason: (_, product) => `Renda abaixo do mínimo de R$ ${product.minimumMonthlyIncome.toLocaleString('pt-BR')}`,
};

export const eligibilityRules = Object.freeze([notOwned, suitability, minimumIncome]);

export function evaluateEligibility(customer, product, rules = eligibilityRules) {
    const violations = rules
        .filter(rule => !rule.isSatisfiedBy(customer, product))
        .map(rule => ({ code: rule.code, reason: rule.reason(customer, product) }));

    return { product, eligible: violations.length === 0, violations };
}

export function splitByEligibility(customer, products) {
    const evaluations = products.map(product => evaluateEligibility(customer, product));

    return {
        eligible: evaluations.filter(e => e.eligible).map(e => e.product),
        blocked: evaluations.filter(e => !e.eligible && !isOnlyOwned(e)),
    };
}

function isOnlyOwned(evaluation) {
    return evaluation.violations.every(v => v.code === notOwned.code);
}
