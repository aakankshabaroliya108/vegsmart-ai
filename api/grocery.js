export const config = { runtime: 'edge' };
import { systemPrompt, chatJSON } from './groq.js';

export default async function handler(request) {
  try {
    const text = await request.text();
    if (!text) throw new Error('Empty request body');

    let parsed;
    try {
      parsed = JSON.parse(text);
    } catch (err) {
      throw new Error('Invalid JSON format');
    }

    const week_plan = parsed?.week_plan;
    if (!week_plan || !Array.isArray(week_plan.days) || week_plan.days.length === 0) {
      throw new Error('Missing or invalid week_plan');
    }

    const forbidden = [
      "onion", "garlic", "shallots", "scallions", "leeks", "mushrooms",
      "eggs", "meat", "fish", "alcohol", "gelatin", "rennet", "vinegar",
      "fermented foods", "caffeine", "chocolate", "pickles", "leftovers"
    ];

    const schema = `GroceryList {
      week_id: string,
      sections: Record<
        "Produce" | "Pantry" | "Dairy/Alternatives" | "Spices" | "Frozen" | "Other",
        { item: string, total_qty: string }[]
      >
    }`;

    const user = `Aggregate this WeekPlan into a GroceryList. Group ingredients into categories: Produce, Pantry, Dairy/Alternatives, Spices, Frozen, Other. Use clear, human-friendly quantities (e.g. "2 cups", "500g", "1 bunch"). Strictly exclude ALL of the following ingredients and their substitutes: ${forbidden.join(', ')}. Do not include them in any section. Output ONLY valid GroceryList JSON. WeekPlan: ${JSON.stringify(week_plan)}`;

    const result = await chatJSON([
      { role: 'system', content: systemPrompt() },
      { role: 'user', content: schema },
      { role: 'user', content: `Important: Never include or suggest any of the following ingredients or their substitutes: ${forbidden.join(', ')}. These are strictly prohibited in sattvic cooking.` },
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
    console.error('Grocery API error:', err);
    return new Response(
      JSON.stringify({ error: 'Internal Server Error', details: err.message }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      }
    );
  }
}
