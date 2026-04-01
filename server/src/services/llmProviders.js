async function postJson(url, body, apiKey, headers = {}) {
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
      ...headers
    },
    body: JSON.stringify(body)
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`LLM request failed (${response.status}): ${text}`);
  }

  return response.json();
}

export async function runGroqExtraction(prompt) {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) throw new Error('GROQ_API_KEY no configurada');

  const body = {
    model: process.env.GROQ_MODEL || 'llama-3.3-70b-versatile',
    messages: [
      { role: 'system', content: 'Extrae reglas tarifarias de transporte en JSON válido y compacto.' },
      { role: 'user', content: prompt }
    ],
    temperature: 0.1,
    response_format: { type: 'json_object' }
  };

  const json = await postJson('https://api.groq.com/openai/v1/chat/completions', body, apiKey);
  return json?.choices?.[0]?.message?.content;
}

export async function runDeepSeekExtraction(prompt) {
  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) throw new Error('DEEPSEEK_API_KEY no configurada');

  const body = {
    model: process.env.DEEPSEEK_MODEL || 'deepseek-chat',
    messages: [
      { role: 'system', content: 'Extrae reglas tarifarias de transporte en JSON válido y compacto.' },
      { role: 'user', content: prompt }
    ],
    temperature: 0.1,
    response_format: { type: 'json_object' }
  };

  const json = await postJson('https://api.deepseek.com/chat/completions', body, apiKey);
  return json?.choices?.[0]?.message?.content;
}
