import { useUi } from '../../ui/UiContext.jsx';
import CategorySheet from './CategorySheet.jsx';
import ExpenseSheet from './ExpenseSheet.jsx';
import GoalDetailSheet from './GoalDetailSheet.jsx';
import GoalSheet from './GoalSheet.jsx';
import ImportSheet from './ImportSheet.jsx';
import RecurringSheet from './RecurringSheet.jsx';

const SHEETS = {
  expense: ExpenseSheet,
  import: ImportSheet,
  category: CategorySheet,
  goal: GoalSheet,
  goalDetail: GoalDetailSheet,
  recurring: RecurringSheet,
};

/** Monta la hoja abierta (solo una a la vez). */
export default function SheetHost() {
  const { sheet, closeSheet } = useUi();
  if (!sheet) return null;
  const Component = SHEETS[sheet.type];
  return Component ? <Component key={sheet.id} onClose={closeSheet} {...sheet.props} /> : null;
}
