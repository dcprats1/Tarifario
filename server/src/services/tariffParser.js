const defaultWeightTiers = [
  { max: 1, price: 4.9 },
  { max: 5, price: 6.9 },
  { max: 10, price: 9.8 },
  { max: 20, price: 14.5 },
  { max: 30, price: 19.4 }
];

function findNumber(text, pattern, fallback) {
  const match = text.match(pattern);
  return match ? Number(match[1].replace(',', '.')) : fallback;
}

function parseRowToTier(row) {
  if (!row?.length) return null;
  const text = row.join(' ').toLowerCase();
  const weightMatch = text.match(/(\d+(?:[.,]\d+)?)\s?(?:kg|kilos?)?/);
  const priceMatch = text.match(/(\d+(?:[.,]\d+)?)\s?€/);
  if (!weightMatch || !priceMatch) return null;

  return {
    max: Number(weightMatch[1].replace(',', '.')),
    price: Number(priceMatch[1].replace(',', '.'))
  };
}

export function parseTariff({ rows, providerHint, sourceFile }) {
  const compactText = rows.flat().join(' ').toLowerCase();
  const providerName = providerHint || sourceFile.replace(/\.[^.]+$/, '');

  const parsedTiers = rows.map(parseRowToTier).filter(Boolean);
  const weightTiers = parsedTiers.length > 0 ? parsedTiers : defaultWeightTiers;

  const zones = ['local', 'nacional', 'internacional'];

  return {
    name: providerName,
    sourceFile,
    rules: {
      zones,
      packageTypes: ['sobre', 'paquete', 'palet'],
      maxWeightKg: findNumber(compactText, /max(?:imo)?\s*(\d+(?:[.,]\d+)?)/, 40),
      volumetricDivisor: findNumber(compactText, /volum(?:etrico)?\s*[/:]\s*(\d+(?:[.,]\d+)?)/, 5000),
      fuelSurchargePct: findNumber(compactText, /combustible\s*(\d+(?:[.,]\d+)?)/, 12),
      insurancePct: findNumber(compactText, /seguro\s*(\d+(?:[.,]\d+)?)/, 1.5),
      overweightPenalty: findNumber(compactText, /penaliz(?:acion)?\s*(\d+(?:[.,]\d+)?)/, 7.5),
      weightTiers
    }
  };
}
