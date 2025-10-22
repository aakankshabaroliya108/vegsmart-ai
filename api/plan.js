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
  const body = await request.json();
  const day = (body?.day || dowName()).slice(0, 3);
  const prefs = body?.prefs || {};
  const rules = body?.rules || {};
  const todayISO = isoDate();

  const schema = `WeekPlan { week_id: string, start_monday: string, days: [{ dow: "Mon"|"Tue"|"Wed"|"Thu"|"Fri"|"Sat"|"Sun", meals: { breakfast: Recipe, lunch: Recipe, dinner: Recipe, snack: Recipe } }] } Recipe { title: string, description: string, ingredients: { item: string, qty: string }[], steps: string[] }`;

  const user = `Create a ONE-DAY plan for ${day}. Constraints: compact recipes, strict sattvic rules, apply user prefs and ConstraintRules. Output ONLY WeekPlan JSON.`;

  return await chatJSON([
    { role: 'system', content: systemPrompt() },
    { role: 'user', content: schema },
    { role: 'user', content: `UserPrefs: ${JSON.stringify(prefs)}` },
    { role: 'user', content: `ConstraintRules: ${JSON.stringify(rules)}` },
    { role: 'user', content: user }
  ]);
}