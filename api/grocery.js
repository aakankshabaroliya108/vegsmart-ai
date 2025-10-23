export const config = { runtime: 'edge' };
import { systemPrompt, chatJSON } from './groq.js';

export default async function handler(request) {
  try {
    const { week_plan } = await request.json();

    if (!week_plan || !week_plan.days) {
      return new Response(
        JSON.stringify({ error: 'Missing or invalid week_plan' }),
        {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          }
        }
      );
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
