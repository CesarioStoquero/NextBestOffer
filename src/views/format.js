const currency = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

export const formatCurrency = value => currency.format(value);

const MIN_VISIBLE = 0.001;

export const formatPercent = value => `${Math.round(value * 100)}%`;

export const formatProbability = value =>
    value < MIN_VISIBLE ? '< 0,1%' : `${(value * 100).toLocaleString('pt-BR', { maximumFractionDigits: 1 })}%`;

export const categoryLabel = Object.freeze({
    cartao: 'Cartão',
    investimento: 'Investimento',
    seguro: 'Seguro',
    emprestimo: 'Crédito',
    previdencia: 'Previdência',
});
