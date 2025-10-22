export const config = { runtime: 'edge' };
import { systemPrompt, chatJSON } from './groq.js';

export default async function handler(request) {
  const { week_plan } = await request.json();

  const schema = `GroceryList { week_id:string, sections:Record<"Produce"|"Pantry"|"Dairy/Alternatives"|"Spices"|"Frozen"|"Other",{item:string,total_qty:string}[]> }`;

  const user = `Aggregate this WeekPlan into a GroceryList. Never include forbidden items. Use human-friendly totals. Output ONLY GroceryList JSON. WeekPlan: ${JSON.stringify(week_plan)}`;

  return await chatJSON([
    { role: 'system', content: systemPrompt() },
    { role: 'user', content: schema },
    { role: 'user', content: user }
  ]);
}