import { formatCurrency } from '../utils/format';

export default function CategoryProgress({ category }) {
  const ratio = category.budget > 0 ? category.spent / category.budget : 0;
  const status = ratio >= 1 ? 'over' : ratio >= 0.8 ? 'warning' : 'ok';

  return (
    <div className="category-progress">
      <div className="category-progress__label">
        <span>{category.icon} {category.name}</span>
        <span>{formatCurrency(category.spent)} / {formatCurrency(category.budget)}</span>
      </div>
      <div className="category-progress__track">
        <div
          className={`category-progress__fill category-progress__fill--${status}`}
          style={{ width: `${Math.min(ratio, 1) * 100}%` }}
        />
      </div>
    </div>
  );
}
