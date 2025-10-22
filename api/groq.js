import 'dotenv/config';

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
