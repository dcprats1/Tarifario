const defaultWeightTiers = [
  { max: 1, price: 4.9 },
  { max: 5, price: 6.9 },
  { max: 10, price: 9.8 },
  { max: 20, price: 14.5 },
  { max: 30, price: 19.4 }
];

const knownZones = ['local', 'nacional', 'internacional'];

function normalizeZone(value = '') {
  const text = String(value).toLowerCase().trim();
  if (text.includes('inter')) return 'internacional';
  if (text.includes('nac')) return 'nacional';
  if (text.includes('loc')) return 'local';
  return text;
}

function findNumber(text, pattern, fallback) {
  const match = text.match(pattern);
  return match ? Number(match[1].replace(',', '.')) : fallback;
}

function parseNumberLike(value) {
  if (value === null || value === undefined) return null;
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value !== 'string') return null;

  const normalized = value.replace(/\s/g, '').replace(',', '.');
  if (!normalized) return null;
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : null;
}

function parseRowToTier(row) {
  if (!row?.length) return null;
  const text = row.map(String).join(' ').toLowerCase();

  const numericCells = row
    .map(parseNumberLike)
    .filter(value => value !== null && value >= 0);

  const weightFromRegex = text.match(/(\d+(?:[.,]\d+)?)\s?(?:kg|kilos?)?/);
  const hasCurrencyToken = /€|eur|usd|\$/.test(text);
  const priceFromCurrencyRegex = text.match(/(?:€|eur|usd|\$)\s*(\d+(?:[.,]\d+)?)|(\d+(?:[.,]\d+)?)\s*(?:€|eur|usd|\$)/);

  const weightValue = weightFromRegex
    ? Number(weightFromRegex[1].replace(',', '.'))
    : numericCells[0] ?? null;

  let priceValue = null;
  if (hasCurrencyToken && priceFromCurrencyRegex) {
    priceValue = Number((priceFromCurrencyRegex[1] || priceFromCurrencyRegex[2]).replace(',', '.'));
  } else if (numericCells.length >= 2) {
    priceValue = numericCells[1];
  }

  if (weightValue === null || priceValue === null) return null;

  const zoneInRow = knownZones.find(zone => text.includes(zone));

  return {
    max: weightValue,
    price: priceValue,
    ...(zoneInRow ? { zone: zoneInRow } : {})
  };
}

export function parseTariff({ rows, providerHint, sourceFile }) {
  const compactText = rows.flat().join(' ').toLowerCase();
  const providerName = providerHint || sourceFile.replace(/\.[^.]+$/, '');

  const parsedTiers = rows.map(parseRowToTier).filter(Boolean);
  const weightTiers = parsedTiers.length > 0 ? parsedTiers : defaultWeightTiers;

  const confidenceBase = parsedTiers.length > 0 ? 0.75 : 0.45;
  const confidence = Math.min(0.95, confidenceBase + Math.min(parsedTiers.length * 0.02, 0.2));

  const zones = knownZones;

  return {
    name: providerName,
    sourceFile,
    confidence,
    rules: {
      zones,
      packageTypes: ['sobre', 'paquete', 'palet'],
      zoneMultipliers: {
        local: findNumber(compactText, /local\s*(\d+(?:[.,]\d+)?)/, 1),
        nacional: findNumber(compactText, /nacional\s*(\d+(?:[.,]\d+)?)/, 1.15),
        internacional: findNumber(compactText, /internacional\s*(\d+(?:[.,]\d+)?)/, 1.35)
      },
      maxWeightKg: findNumber(compactText, /max(?:imo)?\s*(\d+(?:[.,]\d+)?)/, 40),
      volumetricDivisor: findNumber(compactText, /volum(?:etrico)?\s*[/:]\s*(\d+(?:[.,]\d+)?)/, 5000),
      fuelSurchargePct: findNumber(compactText, /combustible\s*(\d+(?:[.,]\d+)?)/, 12),
      insurancePct: findNumber(compactText, /seguro\s*(\d+(?:[.,]\d+)?)/, 1.5),
      overweightPenalty: findNumber(compactText, /penaliz(?:acion)?\s*(\d+(?:[.,]\d+)?)/, 7.5),
      weightTiers
    }
  };
}

export { normalizeZone };
