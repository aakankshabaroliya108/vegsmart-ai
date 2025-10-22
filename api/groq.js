export function systemPrompt() {
  return `You are a meal planner AI that creates sattvic, vegetarian, or Jain meal plans. You must follow strict sattvic rules: no onion, garlic, mushrooms, eggs, meat, alcohol, or overly spicy or fermented foods.

Use the user's preferences and ConstraintRules to guide your choices. Keep recipes compact and easy to follow. Avoid repetition across days.

⚠️ Important: Do NOT format your response as Markdown. Do NOT include triple backticks or \`\`\`json. Respond ONLY with raw JSON matching the schema provided.`;
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
  let text = j?.choices?.[0]?.message?.content;

  if (text?.startsWith('```json')) {
    text = text.replace(/^```json/, '').replace(/```$/, '').trim();
  } else if (text?.startsWith('```')) {
    text = text.replace(/^```/, '').replace(/```$/, '').trim();
  }

  if (!text || typeof text !== 'string') {
    throw new Error('Invalid JSON from model');
  }

  try {
    return JSON.parse(text);
  } catch (e) {
    throw new Error('Failed to parse model response');
  }
}
