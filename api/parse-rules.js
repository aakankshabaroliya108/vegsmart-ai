export const config = { runtime: 'edge' };

export default async function handler(req) {
  const { custom_rules_raw = '' } = await req.json();
  const lines = String(custom_rules_raw).split('\n').map(s => s.trim()).filter(Boolean);

  const rules = { always_avoid: [], limit_quantities: [], prefer_substitutions: [], timing_rules: [] };

  for (const line of lines) {
    const lc = line.toLowerCase();
    if (lc.startsWith('no ') || lc.startsWith('avoid ')) {
      rules.always_avoid.push(lc.replace(/^no |^avoid /, '').trim());
      continue;
    }
    const lim = lc.match(/^limit (.+?) to (.+)$/);
    if (lim) {
      rules.limit_quantities.push({ item: lim[1].trim(), per_day: lim[2].trim() });
      continue;
    }
    const pref = lc.match(/^prefer (.+?) instead of (.+)$/);
    if (pref) {
      rules.prefer_substitutions.push({ from: pref[2].trim(), to: pref[1].trim() });
      continue;
    }
    if (lc.includes('night') || lc.includes('morning')) rules.timing_rules.push(lc);
  }

  return new Response(JSON.stringify(rules), { headers: { 'Content-Type': 'application/json' } });
}