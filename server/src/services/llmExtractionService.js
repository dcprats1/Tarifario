import { runDeepSeekExtraction, runGroqExtraction } from './llmProviders.js';

const providerMap = {
  groq: runGroqExtraction,
  deepseek: runDeepSeekExtraction
};

function toNumber(value, fallback) {
  const parsed = Number(String(value).replace(',', '.'));
  return Number.isFinite(parsed) ? parsed : fallback;
}

function normalizeTier(tier) {
  if (!tier || typeof tier !== 'object') return null;
  const max = toNumber(tier.max, null);
  const price = toNumber(tier.price, null);
  if (max === null || price === null) return null;

  return {
    max,
    price,
    ...(tier.zone ? { zone: String(tier.zone).toLowerCase() } : {})
  };
}

function sanitizeRules(baseRules, llmRules = {}, llmWeightTiers = []) {
  const sanitizedRules = {
    ...baseRules,
    maxWeightKg: toNumber(llmRules.maxWeightKg, baseRules.maxWeightKg),
    volumetricDivisor: toNumber(llmRules.volumetricDivisor, baseRules.volumetricDivisor),
    fuelSurchargePct: toNumber(llmRules.fuelSurchargePct, baseRules.fuelSurchargePct),
    insurancePct: toNumber(llmRules.insurancePct, baseRules.insurancePct),
    overweightPenalty: toNumber(llmRules.overweightPenalty, baseRules.overweightPenalty),
    zoneMultipliers: {
      ...baseRules.zoneMultipliers,
      ...(llmRules.zoneMultipliers && typeof llmRules.zoneMultipliers === 'object'
        ? {
            local: toNumber(llmRules.zoneMultipliers.local, baseRules.zoneMultipliers?.local ?? 1),
            nacional: toNumber(llmRules.zoneMultipliers.nacional, baseRules.zoneMultipliers?.nacional ?? 1.15),
            internacional: toNumber(llmRules.zoneMultipliers.internacional, baseRules.zoneMultipliers?.internacional ?? 1.35)
          }
        : {})
    }
  };

  const normalizedTiers = (Array.isArray(llmWeightTiers) ? llmWeightTiers : [])
    .map(normalizeTier)
    .filter(Boolean);

  sanitizedRules.weightTiers = normalizedTiers.length > 0 ? normalizedTiers : baseRules.weightTiers;
  return sanitizedRules;
}

export async function enrichTariffWithLlm({ provider, rows, confidence }) {
  const threshold = Number(process.env.PARSER_CONFIDENCE_THRESHOLD || 0.65);
  if (confidence >= threshold) {
    return { provider, strategy: 'deterministic', llmProvider: null };
  }

  const llmProvider = process.env.LLM_PROVIDER || 'groq';
  const runner = providerMap[llmProvider];
  if (!runner) {
    return { provider, strategy: 'deterministic', llmProvider: null };
  }

  try {
    const prompt = `Analiza este tarifario y devuelve JSON con claves rules y weightTiers:\n${rows
      .flat()
      .slice(0, 500)
      .join(' | ')}`;

    const raw = await runner(prompt);
    const parsed = JSON.parse(raw);

    return {
      provider: {
        ...provider,
        rules: sanitizeRules(provider.rules, parsed.rules, parsed.weightTiers)
      },
      strategy: 'llm',
      llmProvider
    };
  } catch {
    return { provider, strategy: 'deterministic_fallback', llmProvider };
  }
}
