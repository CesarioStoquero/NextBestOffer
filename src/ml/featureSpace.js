const CATEGORIES = Object.freeze(['cartao', 'investimento', 'seguro', 'emprestimo', 'previdencia']);
const WEIGHTS = Object.freeze({ category: 0.4, risk: 0.3, fee: 0.2, holderAge: 0.1 });
const MAX_RISK_SPAN = 2;
const NEUTRAL = 0.5;

const normalize = (value, min, max) => (max === min ? NEUTRAL : (value - min) / (max - min));
const average = values => values.reduce((sum, v) => sum + v, 0) / values.length;
const oneHot = (value, options, weight) => options.map(option => (option === value ? weight : 0));

export function buildFeatureSpace(customers, products) {
    const ages = customers.map(c => c.age);
    const incomes = customers.map(c => Math.log10(c.monthlyIncome));
    const bounds = {
        minAge: Math.min(...ages),
        maxAge: Math.max(...ages),
        minIncome: Math.min(...incomes),
        maxIncome: Math.max(...incomes),
        maxFee: Math.max(...products.map(p => p.monthlyFee)),
    };
    const holderAge = averageHolderAgeByProduct(customers, products, bounds);

    const encodeProduct = product => [
        ...oneHot(product.category, CATEGORIES, WEIGHTS.category),
        ((product.risk - 1) / MAX_RISK_SPAN) * WEIGHTS.risk,
        normalize(product.monthlyFee, 0, bounds.maxFee) * WEIGHTS.fee,
        holderAge.get(product.id) * WEIGHTS.holderAge,
    ];

    const productVectors = new Map(products.map(p => [p.id, encodeProduct(p)]));

    const encodeProfile = customer => [
        normalize(customer.age, bounds.minAge, bounds.maxAge),
        normalize(Math.log10(customer.monthlyIncome), bounds.minIncome, bounds.maxIncome),
        (customer.riskProfile - 1) / MAX_RISK_SPAN,
    ];

    const encodePortfolio = customer => {
        const owned = customer.productIds.map(id => productVectors.get(id)).filter(Boolean);
        const dimension = encodeProduct(products[0]).length;
        return owned.length === 0
            ? new Array(dimension).fill(0)
            : Array.from({ length: dimension }, (_, i) => average(owned.map(v => v[i])));
    };

    const encodeCustomer = customer => [...encodePortfolio(customer), ...encodeProfile(customer)];

    return {
        encodeProduct: product => productVectors.get(product.id) ?? encodeProduct(product),
        encodeCustomer,
        inputSize: encodeCustomer(customers[0]).length + encodeProduct(products[0]).length,
    };
}

export function buildTrainingSet(space, customers, products) {
    const inputs = [];
    const labels = [];

    for (const customer of customers.filter(c => c.productIds.length > 0)) {
        const customerVector = space.encodeCustomer(customer);
        for (const product of products) {
            inputs.push([...customerVector, ...space.encodeProduct(product)]);
            labels.push(customer.productIds.includes(product.id) ? 1 : 0);
        }
    }

    return { inputs, labels };
}

function averageHolderAgeByProduct(customers, products, { minAge, maxAge }) {
    return new Map(products.map(product => {
        const holders = customers.filter(c => c.productIds.includes(product.id));
        const value = holders.length === 0
            ? NEUTRAL
            : normalize(average(holders.map(h => h.age)), minAge, maxAge);
        return [product.id, value];
    }));
}
