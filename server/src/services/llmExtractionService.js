import { runDeepSeekExtraction, runGroqExtraction } from './llmProviders.js';

const providerMap = {
  groq: runGroqExtraction,
  deepseek: runDeepSeekExtraction
};

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
        rules: {
          ...provider.rules,
          ...parsed.rules,
          weightTiers: parsed.weightTiers?.length ? parsed.weightTiers : provider.rules.weightTiers
        }
      },
      strategy: 'llm',
      llmProvider
    };
  } catch {
    return { provider, strategy: 'deterministic_fallback', llmProvider };
  }
}
