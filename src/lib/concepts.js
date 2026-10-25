// Memoria de conceptos: sugiere conceptos habituales y recuerda su categoría.

export function normalizeConcept(text) {
  return String(text ?? '')
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '');
}

/** Conceptos más usados en los últimos `days` días. */
export function topConcepts(expenses, { now = new Date(), days = 120, limit = 8 } = {}) {
  const since = now.getTime() - days * 86400000;
  const map = new Map();
  for (const e of expenses) {
    if (!e.concept) continue;
    const at = new Date(e.date).getTime();
    if (at < since || e.recurringId) continue;
    const key = normalizeConcept(e.concept);
    if (!key) continue;
    const cur = map.get(key);
    if (!cur) {
      map.set(key, { concept: e.concept, category: e.category, count: 1, last: at, lastAmount: e.amount });
    } else {
      cur.count += 1;
      if (at >= cur.last) Object.assign(cur, { concept: e.concept, category: e.category, last: at, lastAmount: e.amount });
    }
  }
  return [...map.values()].sort((a, b) => b.count - a.count || b.last - a.last).slice(0, limit);
}

/** Categoría habitual de un concepto ya usado (coincidencia exacta normalizada). */
export function categoryForConcept(expenses, text) {
  const key = normalizeConcept(text);
  if (!key) return null;
  let best = null;
  for (const e of expenses) {
    if (normalizeConcept(e.concept) !== key) continue;
    const at = new Date(e.date).getTime();
    if (!best || at > best.at) best = { at, category: e.category };
  }
  return best ? best.category : null;
}
