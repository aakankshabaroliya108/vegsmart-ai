export async function POST(req) {
  const { messages, model } = await req.json();

  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: model || process.env.GROQ_MODEL,
      messages,
      temperature: 0.7
    })
  });

  const j = await res.json();
  const text = j?.choices?.[0]?.message?.content;

  if (!text || typeof text !== 'string') {
    return new Response(JSON.stringify({ error: 'Invalid JSON', raw: JSON.stringify(j) }), { status: 500 });
  }

  try {
    const parsed = JSON.parse(text);
    return new Response(JSON.stringify(parsed));
  } catch (e) {
    return new Response(JSON.stringify({ error: 'Invalid JSON', raw: text }), { status: 500 });
  }
}

export function systemPrompt() {
  return `You are a meal planner AI that creates sattvic, vegetarian, or Jain meal plans. You must follow strict sattvic rules: no onion, garlic, mushrooms, eggs, meat, alcohol, or overly spicy or fermented foods.

Use the user's preferences and ConstraintRules to guide your choices. Keep recipes compact and easy to follow. Avoid repetition across days. Return only valid JSON matching the schema provided.

Respond only with the WeekPlan JSON. Do not include any explanation or extra text.`;
}

export async function chatJSON(messages, model = process.env.GROQ_MODEL) {
  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model,
      messages,
      temperature: 0.7
    })
  });

  const j = await res.json();
  const text = j?.choices?.[0]?.message?.content;

  if (!text || typeof text !== 'string') {
    return new Response(JSON.stringify({ error: 'Invalid JSON', raw: JSON.stringify(j) }), { status: 500 });
  }

  try {
    const parsed = JSON.parse(text);
    return new Response(JSON.stringify(parsed));
  } catch (e) {
    return new Response(JSON.stringify({ error: 'Invalid JSON', raw: text }), { status: 500 });
  }
}

