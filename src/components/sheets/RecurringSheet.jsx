import { useState } from 'react';
import Sheet from '../Sheet.jsx';
import Icon, { Badge } from '../Icon.jsx';
import { useData } from '../../data/DataProvider.jsx';
import { useUi } from '../../ui/UiContext.jsx';
import { deleteRecurring, saveRecurring } from '../../data/actions.js';
import { parseAmount } from '../../lib/format.js';

/** Gasto fijo mensual (alquiler, suscripciones…): se apunta solo cada mes. */
export default function RecurringSheet({ item = null, onClose }) {
  const { categories } = useData();
  const ui = useUi();
  const editing = Boolean(item);
  const [concept, setConcept] = useState(item?.concept ?? '');
  const [amount, setAmount] = useState(item ? String(item.amount).replace('.', ',') : '');
  const [categoryId, setCategoryId] = useState(item?.category ?? categories.find((c) => c.name === 'Suscripciones')?.id ?? categories[0]?.id);
  const [day, setDay] = useState(item?.day ?? Math.min(new Date().getDate(), 28));
  const [confirming, setConfirming] = useState(false);

  const valid = concept.trim().length > 0 && parseAmount(amount) > 0 && categoryId;

  const save = async (close) => {
    await saveRecurring({ id: item?.id, concept, amount: parseAmount(amount), category: categoryId, day });
    ui.toast({ text: editing ? 'Gasto fijo actualizado.' : 'Gasto fijo creado. Yo lo apunto cada mes.', mood: 'happy', duration: 2600 });
    close();
  };
  const remove = async (close) => {
    await deleteRecurring(item.id);
    close();
  };

  return (
    <Sheet
      onClose={onClose}
      size="tall"
      title={editing ? 'Editar gasto fijo' : 'Nuevo gasto fijo'}
      actions={
        editing && (
          <button className="icon-btn" onClick={() => setConfirming(true)} aria-label="Borrar gasto fijo">
            <Icon name="trash" size={18} />
          </button>
        )
      }
      footer={(close) =>
        confirming ? (
          <div className="confirm">
            <p>Dejará de apuntarse. Los gastos ya creados se quedan. ¿Borrar?</p>
            <div className="row">
              <button className="btn btn--ghost" onClick={() => setConfirming(false)}>Cancelar</button>
              <button className="btn btn--danger" onClick={() => remove(close)}>Sí, borrar</button>
            </div>
          </div>
        ) : (
          <button className="btn btn--primary btn--block" disabled={!valid} onClick={() => save(close)}>
            {editing ? 'Guardar cambios' : 'Crear gasto fijo'}
          </button>
        )
      }
    >
      <label className="field">
        <span className="field__label">Concepto</span>
        <input value={concept} onChange={(e) => setConcept(e.target.value)} placeholder="Alquiler, Netflix, gimnasio…" maxLength={30} />
      </label>

      <label className="field">
        <span className="field__label">Importe al mes</span>
        <input value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="9,99" inputMode="decimal" />
      </label>

      <div className="field">
        <span className="field__label">Día del mes que se cobra</span>
        <div className="stepper">
          <button className="icon-btn" onClick={() => setDay((d) => (d <= 1 ? 31 : d - 1))} aria-label="Día anterior"><Icon name="minus" size={18} weight="bold" /></button>
          <b className="display tnum stepper__value">{day}</b>
          <button className="icon-btn" onClick={() => setDay((d) => (d >= 31 ? 1 : d + 1))} aria-label="Día siguiente"><Icon name="plus" size={18} weight="bold" /></button>
        </div>
        {day > 28 && <small className="muted">En los meses más cortos se cobrará el último día.</small>}
      </div>

      <div className="field">
        <span className="field__label">Categoría</span>
        <div className="catpick catpick--wrap" role="radiogroup" aria-label="Categoría">
          {categories.map((c) => (
            <button key={c.id} role="radio" aria-checked={categoryId === c.id} className={`catpick__item ${categoryId === c.id ? 'is-active' : ''}`} onClick={() => setCategoryId(c.id)} style={{ '--c': `var(--cat-${c.color})` }}>
              <Badge icon={c.icon} color={c.color} size={42} />
              <span>{c.name}</span>
            </button>
          ))}
        </div>
      </div>
    </Sheet>
  );
}
