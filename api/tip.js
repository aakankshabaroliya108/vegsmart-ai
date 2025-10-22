export const config = { runtime: 'edge' };
import { systemPrompt, chatJSON } from './groq.js';

export default async function handler() {
  const user = `Provide one short (<40 words) Ayurvedic or sattvic lifestyle tip. Plain text only.`;

  const r = await chatJSON([
    { role: 'system', content: systemPrompt() },
    { role: 'user', content: user }
  ]);

  const j = await r.json();
  return new Response(j?.tip || '🌿 Eat fresh, seasonal, and local foods.', { headers: { 'Content-Type': 'text/plain' } });
}