function selectTier(weightTiers, billableWeightKg) {
  const sorted = [...weightTiers].sort((a, b) => a.max - b.max);
  return sorted.find(t => billableWeightKg <= t.max) || sorted.at(-1);
}

export function quoteProvider(provider, shipment) {
  const { rules } = provider;
  const volumetricWeight = (shipment.lengthCm * shipment.widthCm * shipment.heightCm) / rules.volumetricDivisor;
  const billableWeightKg = Math.max(shipment.weightKg, volumetricWeight);

  const tier = selectTier(rules.weightTiers, billableWeightKg);
  const basePrice = tier.price;

  const fuelSurcharge = basePrice * (rules.fuelSurchargePct / 100);
  const insurance = (shipment.insuredValue || 0) * (rules.insurancePct / 100);
  const overweightPenalty = billableWeightKg > rules.maxWeightKg ? rules.overweightPenalty : 0;

  const surchargesTotal = fuelSurcharge + insurance + overweightPenalty;
  const total = basePrice + surchargesTotal;

  return {
    providerId: provider.id,
    providerName: provider.name,
    billableWeightKg,
    basePrice,
    surchargesTotal,
    total,
    breakdown: {
      fuelSurcharge,
      insurance,
      overweightPenalty
    }
  };
}
