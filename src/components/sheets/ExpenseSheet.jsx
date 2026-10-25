import { useEffect, useMemo, useRef, useState } from 'react';
import Sheet from '../Sheet.jsx';
import Keypad from '../Keypad.jsx';
import Icon, { Badge } from '../Icon.jsx';
import { useData } from '../../data/DataProvider.jsx';
import { useUi } from '../../ui/UiContext.jsx';
import { addExpense, deleteExpense, updateExpense } from '../../data/actions.js';
import { amountToText, displayAmount, pressKey } from '../../lib/amountInput.js';
import { categoryForConcept, normalizeConcept, topConcepts } from '../../lib/concepts.js';
import { formatCurrency, formatSmart, fromInputDate, parseAmount, shortDate, toInputDate } from '../../lib/format.js';

const typing = (el) => el && ['INPUT', 'TEXTAREA', 'SELECT'].includes(el.tagName);

/** Alta y edición de un gasto: teclado propio, categorías de un toque y conceptos habituales. */
export default function ExpenseSheet({ expense = null, onClose }) {
  const { categories, expenses } = useData();
  const ui = useUi();
  const editing = Boolean(expense);

  const lastCategory = useMemo(() => {
    const last = [...expenses].sort((a, b) => new Date(b.date) - new Date(a.date))[0];
    return last && categories.some((c) => c.id === last.category) ? last.category : categories[0]?.id ?? null;
  }, [expenses, categories]);

  const [amount, setAmount] = useState(editing ? amountToText(expense.amount) : '');
  const [categoryId, setCategoryId] = useState(editing ? expense.category : lastCategory);
  const [concept, setConcept] = useState(editing ? expense.concept : '');
  const [day, setDay] = useState(editing ? toInputDate(expense.date) : toInputDate(new Date()));
  const [picked, setPicked] = useState(editing);
  const [confirming, setConfirming] = useState(false);
  const [saving, setSaving] = useState(false);

  const value = parseAmount(amount);
  const valid = value > 0 && categoryId !== null;
  const today = toInputDate(new Date());
  const yesterday = toInputDate(new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate() - 1));

  const suggestions = useMemo(() => {
    const typed = normalizeConcept(concept);
    return topConcepts(expenses, { limit: 12 })
      .filter((s) => !typed || (normalizeConcept(s.concept).startsWith(typed) && normalizeConcept(s.concept) !== typed))
      .slice(0, 6);
  }, [expenses, concept]);

  const press = (key) => {
    setAmount((v) => pressKey(v, key));
    ui.haptic(6);
  };

  const onConcept = (text) => {
    setConcept(text);
    if (!picked) {
      const known = categoryForConcept(expenses, text);
      if (known && categories.some((c) => c.id === known)) setCategoryId(known);
    }
  };

  const applySuggestion = (s) => {
    setConcept(s.concept);
    if (categories.some((c) => c.id === s.category)) setCategoryId(s.category);
    setPicked(true);
    ui.haptic(8);
  };

  const chooseCategory = (id) => {
    setCategoryId(id);
    setPicked(true);
    ui.haptic(8);
  };

  const dateFromDay = () => {
    if (editing && day === toInputDate(expense.date)) return expense.date;
    if (!editing && day === today) return new Date();
    return fromInputDate(day);
  };

  const save = async (close) => {
    if (!valid || saving) return;
    setSaving(true);
    const cat = categories.find((c) => c.id === categoryId);
    const text = concept.trim() || cat?.name || 'Gasto';
    const payload = { amount: value, concept: text, category: categoryId, date: dateFromDay() };
    let alert;
    if (editing) {
      alert = await updateExpense(expense.id, payload, expense);
    } else {
      ({ alert } = await addExpense(payload));
    }
    ui.haptic([12, 30, 12]);
    if (alert) ui.notifyAlert(alert);
    else ui.toast({ text: editing ? 'Cambios guardados.' : `${formatSmart(value)} en ${cat?.name ?? 'tu gasto'}. Anotado.`, mood: 'happy', duration: 2400 });
    close();
  };

  const remove = async (close) => {
    await deleteExpense(expense.id);
    ui.haptic(20);
    ui.toast({ text: 'Gasto borrado.', mood: 'watchful', duration: 2000 });
    close();
  };

  // Teclado físico: cifras, coma, borrar e intro.
  const saveRef = useRef(null);
  useEffect(() => {
    const onKey = (e) => {
      if (typing(e.target) || e.metaKey || e.ctrlKey || e.altKey) return;
      if (/^\d$/.test(e.key)) press(e.key);
      else if (e.key === ',' || e.key === '.') press(',');
      else if (e.key === 'Backspace') press('back');
      else if (e.key === 'Enter') saveRef.current?.click();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  const scroller = useRef(null);
  useEffect(() => {
    // Centra la categoría elegida sin tocar el desplazamiento de nadie más (scrollIntoView movía toda la app).
    const row = scroller.current;
    const active = row?.querySelector('.is-active');
    if (row && active) row.scrollLeft = active.offsetLeft - (row.clientWidth - active.offsetWidth) / 2;
  }, []);

  return (
    <Sheet
      onClose={onClose}
      size="tall"
      title={editing ? 'Editar gasto' : 'Nuevo gasto'}
      actions={
        editing ? (
          <button className="icon-btn" onClick={() => setConfirming(true)} aria-label="Borrar gasto">
            <Icon name="trash" size={18} />
          </button>
        ) : (
          <button className="icon-btn icon-btn--accent" onClick={() => ui.openSheet('import')} aria-label="Importar desde una captura">
            <Icon name="camera" size={18} weight="bold" />
          </button>
        )
      }
      footer={(close) =>
        confirming ? (
          <div className="confirm">
            <p>¿Seguro que quieres borrar este gasto?</p>
            <div className="row">
              <button className="btn btn--ghost" onClick={() => setConfirming(false)}>Cancelar</button>
              <button className="btn btn--danger" onClick={() => remove(close)}>Sí, borrar</button>
            </div>
          </div>
        ) : (
          <button ref={saveRef} className="btn btn--primary btn--block" disabled={!valid || saving} onClick={() => save(close)}>
            {editing ? 'Guardar cambios' : value > 0 ? `Guardar ${formatCurrency(value)}` : 'Guardar gasto'}
          </button>
        )
      }
    >
      <div className="amount-display" aria-live="polite">
        <span className={`amount-display__value display tnum ${amount ? '' : 'is-empty'}`}>{displayAmount(amount)}</span>
        <span className="amount-display__cur display">€</span>
      </div>

      <div className="catpick scroll-x" ref={scroller} role="radiogroup" aria-label="Categoría">
        {categories.map((c) => (
          <button
            key={c.id}
            role="radio"
            aria-checked={categoryId === c.id}
            className={`catpick__item ${categoryId === c.id ? 'is-active' : ''}`}
            onClick={() => chooseCategory(c.id)}
            style={{ '--c': `var(--cat-${c.color})` }}
          >
            <Badge icon={c.icon} color={c.color} size={46} />
            <span>{c.name}</span>
          </button>
        ))}
      </div>

      <label className="field field--icon">
        <Icon name="pencil" size={18} />
        <input
          type="text"
          value={concept}
          onChange={(e) => onConcept(e.target.value)}
          placeholder="Concepto (opcional)"
          enterKeyHint="done"
          autoComplete="off"
          aria-label="Concepto"
        />
      </label>

      {suggestions.length > 0 && (
        <div className="suggest scroll-x" aria-label="Conceptos habituales">
          {suggestions.map((s) => (
            <button key={s.concept} className="chip" onClick={() => applySuggestion(s)}>
              {s.concept}
            </button>
          ))}
        </div>
      )}

      <div className="daypick">
        <button className={`chip ${day === today ? 'is-active' : ''}`} onClick={() => setDay(today)}>Hoy</button>
        <button className={`chip ${day === yesterday ? 'is-active' : ''}`} onClick={() => setDay(yesterday)}>Ayer</button>
        <label className={`chip chip--date ${day !== today && day !== yesterday ? 'is-active' : ''}`}>
          <Icon name="calendar" size={16} />
          <span>{day !== today && day !== yesterday ? shortDate(fromInputDate(day)) : 'Otro día'}</span>
          <input type="date" value={day} max={today} onChange={(e) => e.target.value && setDay(e.target.value)} aria-label="Fecha del gasto" />
        </label>
      </div>

      <Keypad onKey={press} />
    </Sheet>
  );
}
