export const RiskProfile = Object.freeze({
    conservative: 1,
    moderate: 2,
    aggressive: 3,
});

export const riskLabel = Object.freeze({
    [RiskProfile.conservative]: 'Conservador',
    [RiskProfile.moderate]: 'Moderado',
    [RiskProfile.aggressive]: 'Arrojado',
});
