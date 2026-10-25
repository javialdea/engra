import { useState } from 'react';
import Sheet from '../Sheet.jsx';
import Icon, { Badge } from '../Icon.jsx';
import { useUi } from '../../ui/UiContext.jsx';
import { deleteGoal, saveGoal } from '../../data/actions.js';
import { COLOR_SLOTS, GOAL_ICON_CHOICES } from '../../lib/catalog.js';
import { parseAmount, toInputDate } from '../../lib/format.js';

/** Crear o editar un objetivo de ahorro. */
export default function GoalSheet({ goal = null, onClose }) {
  const ui = useUi();
  const editing = Boolean(goal);
  const [name, setName] = useState(goal?.name ?? '');
  const [target, setTarget] = useState(goal ? String(goal.targetAmount).replace('.', ',') : '');
  const [date, setDate] = useState(goal?.targetDate ? toInputDate(goal.targetDate) : '');
  const [icon, setIcon] = useState(goal?.icon ?? 'piggy');
  const [color, setColor] = useState(goal?.color ?? 2);
  const [confirming, setConfirming] = useState(false);

  const valid = name.trim().length > 0 && parseAmount(target) > 0;

  const save = async (close) => {
    await saveGoal({ id: goal?.id, name, targetAmount: parseAmount(target), targetDate: date || null, icon, color });
    ui.haptic(12);
    close();
  };
  const remove = async (close) => {
    await deleteGoal(goal.id);
    ui.toast({ text: `Objetivo "${goal.name}" borrado.`, mood: 'watchful', duration: 2400 });
    close();
  };

  return (
    <Sheet
      onClose={onClose}
      size="tall"
      title={editing ? 'Editar objetivo' : 'Nuevo objetivo'}
      actions={
        editing && (
          <button className="icon-btn" onClick={() => setConfirming(true)} aria-label="Borrar objetivo">
            <Icon name="trash" size={18} />
          </button>
        )
      }
      footer={(close) =>
        confirming ? (
          <div className="confirm">
            <p>Se borrarán también sus aportaciones. ¿Seguro?</p>
            <div className="row">
              <button className="btn btn--ghost" onClick={() => setConfirming(false)}>Cancelar</button>
              <button className="btn btn--danger" onClick={() => remove(close)}>Sí, borrar</button>
            </div>
          </div>
        ) : (
          <button className="btn btn--primary btn--block" disabled={!valid} onClick={() => save(close)}>
            {editing ? 'Guardar cambios' : 'Crear objetivo'}
          </button>
        )
      }
    >
      <div className="preview-badge">
        <Badge icon={icon} color={color} size={64} />
        <strong className="display">{name.trim() || 'Mi objetivo'}</strong>
      </div>

      <label className="field">
        <span className="field__label">¿Para qué ahorras?</span>
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Vacaciones, un portátil…" maxLength={28} />
      </label>

      <label className="field">
        <span className="field__label">Cantidad que quieres juntar</span>
        <input value={target} onChange={(e) => setTarget(e.target.value)} placeholder="1.000" inputMode="decimal" />
      </label>

      <label className="field">
        <span className="field__label">Fecha objetivo (opcional)</span>
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
      </label>

      <div className="field">
        <span className="field__label">Color</span>
        <div className="swatches" role="radiogroup" aria-label="Color">
          {COLOR_SLOTS.slice(0, 7).map((slot) => (
            <button key={slot} role="radio" aria-checked={color === slot} className={`swatch ${color === slot ? 'is-active' : ''}`} style={{ '--c': `var(--cat-${slot})` }} onClick={() => setColor(slot)} aria-label={`Color ${slot + 1}`} />
          ))}
        </div>
      </div>

      <div className="field">
        <span className="field__label">Icono</span>
        <div className="icongrid" role="radiogroup" aria-label="Icono">
          {GOAL_ICON_CHOICES.map((key) => (
            <button key={key} role="radio" aria-checked={icon === key} className={`icongrid__item ${icon === key ? 'is-active' : ''}`} style={{ '--c': `var(--cat-${color})` }} onClick={() => setIcon(key)} aria-label={key}>
              <Icon name={key} size={22} weight={icon === key ? 'duotone' : 'regular'} />
            </button>
          ))}
        </div>
      </div>
    </Sheet>
  );
}
