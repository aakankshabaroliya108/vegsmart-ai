export const config = { runtime: 'edge' };
import { systemPrompt, chatJSON } from './groq.js';

function dowName(d = new Date()) {
  return ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][d.getUTCDay()];
}
function isoDate(d = new Date()) {
  const y = d.getUTCFullYear(), m = String(d.getUTCMonth() + 1).padStart(2, '0'), dd = String(d.getUTCDate()).padStart(2, '0');
  return `${y}-${m}-${dd}`;
}

export default async function handler(request) {
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
      }
    });
  }

  try {
    let body = {};
    const contentType = request.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      try {
        body = await request.json();
      } catch {
        body = {};
      }
    }

    const day = (body?.day || dowName()).slice(0, 3);
    const prefs = body?.prefs || {};
    const rules = body?.rules || {};
    const todayISO = isoDate();

    const schema = `WeekPlan { week_id: string, start_monday: string, days: [{ dow: "Mon"|"Tue"|"Wed"|"Thu"|"Fri"|"Sat"|"Sun", meals: { breakfast: Recipe, lunch: Recipe, dinner: Recipe, snack: Recipe } }] } Recipe { title: string, description: string, ingredients: { item: string, qty: string }[], steps: string[] }`;

    const user = `Create a ONE-DAY plan for ${day}. Constraints: compact recipes, strict sattvic rules, apply user prefs and ConstraintRules. Output ONLY WeekPlan JSON.`;

    const result = await chatJSON([
      { role: 'system', content: systemPrompt() },
      { role: 'user', content: schema },
      { role: 'user', content: `UserPrefs: ${JSON.stringify(prefs)}` },
      { role: 'user', content: `ConstraintRules: ${JSON.stringify(rules)}` },
      { role: 'user', content: user }
    ]);

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  } catch (err) {
    console.error('Function error:', err);
    return new Response(JSON.stringify({ error: 'Internal Server Error', details: err.message }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }
}
