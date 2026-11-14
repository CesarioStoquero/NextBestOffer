export function rankByPopularity(candidates, customers, take) {
    const holders = productId => customers.filter(c => c.productIds.includes(productId)).length;

    return [...candidates]
        .map(product => ({ product, score: holders(product.id) / customers.length }))
        .sort((a, b) => b.score - a.score || a.product.monthlyFee - b.product.monthlyFee)
        .slice(0, take);
}
