import Icon, { Badge } from './Icon.jsx';
import { formatCurrency } from '../lib/format.js';

const NO_CATEGORY = { icon: 'tag', color: 7, name: 'Sin categoría' };

/** Fila de un gasto: insignia de la categoría, concepto, categoría e importe. */
export default function ExpenseRow({ expense, category, onClick }) {
  const cat = category ?? NO_CATEGORY;
  return (
    <button className="xrow" onClick={onClick}>
      <Badge icon={cat.icon} color={cat.color} size={42} />
      <span className="xrow__main">
        <b>{expense.concept || cat.name}</b>
        <small>
          {cat.name}
          {expense.recurringId && (
            <span className="xrow__tag">
              <Icon name="repeat" size={11} weight="bold" /> fijo
            </span>
          )}
        </small>
      </span>
      <b className="xrow__amt tnum">{formatCurrency(expense.amount)}</b>
    </button>
  );
}
