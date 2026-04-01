import { normalizeZone } from './tariffParser.js';

function selectTier(weightTiers, billableWeightKg, destinationZone) {
  const normalizedZone = normalizeZone(destinationZone);
  const sorted = [...weightTiers].sort((a, b) => a.max - b.max);

  const zoneTiers = sorted.filter(t => normalizeZone(t.zone || '') === normalizedZone);
  const tiersToUse = zoneTiers.length > 0 ? zoneTiers : sorted;

  return tiersToUse.find(t => billableWeightKg <= t.max) || tiersToUse.at(-1);
}

export function quoteProvider(provider, shipment) {
  const { rules } = provider;
  const volumetricWeight = (shipment.lengthCm * shipment.widthCm * shipment.heightCm) / rules.volumetricDivisor;
  const billableWeightKg = Math.max(shipment.weightKg, volumetricWeight);

  const tier = selectTier(rules.weightTiers, billableWeightKg, shipment.destinationZone);
  const zone = normalizeZone(shipment.destinationZone);
  const zoneMultiplier = rules.zoneMultipliers?.[zone] ?? 1;

  const basePrice = (tier?.price || 0) * zoneMultiplier;

  const fuelSurcharge = basePrice * (rules.fuelSurchargePct / 100);
  const insurance = (shipment.insuredValue || 0) * (rules.insurancePct / 100);
  const overweightPenalty = billableWeightKg > rules.maxWeightKg ? rules.overweightPenalty : 0;

  const surchargesTotal = fuelSurcharge + insurance + overweightPenalty;
  const total = basePrice + surchargesTotal;

  return {
    providerId: provider.id,
    providerName: provider.name,
    destinationZone: zone || shipment.destinationZone,
    billableWeightKg,
    basePrice,
    surchargesTotal,
    total,
    breakdown: {
      zoneMultiplier,
      fuelSurcharge,
      insurance,
      overweightPenalty
    }
  };
}
