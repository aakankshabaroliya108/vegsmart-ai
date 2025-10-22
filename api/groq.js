export const config = { runtime: 'edge' };

export function systemPrompt() {
  return `You are a sattvic vegetarian meal planner.
- Permanently exclude: meat, fish, seafood, eggs, alcohol, mushrooms, onion, garlic, leeks, shallots, or animal stocks/sauces.
- Diet modes:
  * Jain: also exclude all root vegetables, honey, fermented foods.
  * Sattvic: allow roots; avoid fermented/overly-spicy/tamasic/processed.
  * Vegan: exclude dairy; use plant-based substitutes.
- Apply avoid_list and ConstraintRules.
- Keep responses VERY COMPACT so they fit under 800 tokens.
Return ONLY valid JSON matching the requested schema. No prose.`;
}

export async function chatJSON(messages) {
  const key = process.env.GROQ_API_KEY;
  const model = process.env.GROQ_MODEL || 'mixtral-8x7b-32768';
  if (!key) return new Response(JSON.stringify({ error: 'Missing GROQ_API_KEY' }), { status: 500 });

  const body = { model, messages, temperature: 0.2, stream: false };
  const r = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });

  const j = await r.json();
  const text = j?.choices?.[0]?.message?.content || '';
  try {
    const parsed = JSON.parse(text);
    return new Response(JSON.stringify(parsed), { headers: { 'Content-Type': 'application/json' } });
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON', raw: text }), { status: 500 });
  }
}