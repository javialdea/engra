import { db } from '../db';
import { currentMonthRange } from './format';

export async function checkCategoryAlert(categoryId) {
  const category = await db.categories.get(categoryId);
  if (!category || category.budget <= 0) return null;

  const settings = await db.settings.get('app');
  const threshold = settings?.alertThreshold ?? 1;

  const { start, end } = currentMonthRange();
  const expenses = await db.expenses.where('category').equals(categoryId).toArray();
  const spent = expenses
    .filter((e) => {
      const d = new Date(e.date);
      return d >= start && d < end;
    })
    .reduce((sum, e) => sum + e.amount, 0);

  const ratio = spent / category.budget;
  if (ratio >= threshold) {
    return `Cuidado: llevas ${Math.round(ratio * 100)}% del presupuesto de ${category.name} este mes.`;
  }
  return null;
}
