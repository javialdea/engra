import { useState } from 'react';
import Sheet from '../Sheet.jsx';
import Icon, { Badge } from '../Icon.jsx';
import { useUi } from '../../ui/UiContext.jsx';
import { deleteCategory, saveCategory } from '../../data/actions.js';
import { CATEGORY_ICON_CHOICES, COLOR_SLOTS } from '../../lib/catalog.js';
import { parseAmount } from '../../lib/format.js';

/** Crear o editar una categoría: nombre, icono, color y presupuesto mensual. */
export default function CategorySheet({ category = null, nextColor = 0, onClose }) {
  const ui = useUi();
  const editing = Boolean(category);
  const [name, setName] = useState(category?.name ?? '');
  const [icon, setIcon] = useState(category?.icon ?? 'tag');
  const [color, setColor] = useState(category?.color ?? nextColor);
  const [budget, setBudget] = useState(String(category?.budget ?? 50).replace('.', ','));
  const [confirming, setConfirming] = useState(false);

  const value = parseAmount(budget);
  const step = (delta) => setBudget(String(Math.max(0, value + delta)).replace('.', ','));
  const valid = name.trim().length > 0;

  const save = async (close) => {
    await saveCategory({ id: category?.id, name, icon, color, budget: value });
    ui.haptic(12);
    close();
  };
  const remove = async (close) => {
    await deleteCategory(category.id);
    ui.toast({ text: `${category.name} borrada. Sus gastos pasan a "Otros".`, mood: 'watchful', duration: 3000 });
    close();
  };

  return (
    <Sheet
      onClose={onClose}
      size="tall"
      title={editing ? 'Editar categoría' : 'Nueva categoría'}
      actions={
        editing && (
          <button className="icon-btn" onClick={() => setConfirming(true)} aria-label="Borrar categoría">
            <Icon name="trash" size={18} />
          </button>
        )
      }
      footer={(close) =>
        confirming ? (
          <div className="confirm">
            <p>Sus gastos pasarán a "Otros". ¿Borrar {category.name}?</p>
            <div className="row">
              <button className="btn btn--ghost" onClick={() => setConfirming(false)}>Cancelar</button>
              <button className="btn btn--danger" onClick={() => remove(close)}>Sí, borrar</button>
            </div>
          </div>
        ) : (
          <button className="btn btn--primary btn--block" disabled={!valid} onClick={() => save(close)}>
            {editing ? 'Guardar cambios' : 'Crear categoría'}
          </button>
        )
      }
    >
      <div className="preview-badge">
        <Badge icon={icon} color={color} size={64} />
        <strong className="display">{name.trim() || 'Nueva categoría'}</strong>
      </div>

      <label className="field">
        <span className="field__label">Nombre</span>
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Por ejemplo, Mascotas" maxLength={24} />
      </label>

      <div className="field">
        <span className="field__label">Presupuesto al mes</span>
        <div className="stepper">
          <button className="icon-btn" onClick={() => step(-10)} aria-label="Menos"><Icon name="minus" size={18} weight="bold" /></button>
          <input value={budget} onChange={(e) => setBudget(e.target.value)} inputMode="decimal" aria-label="Presupuesto" />
          <span className="display">€</span>
          <button className="icon-btn" onClick={() => step(10)} aria-label="Más"><Icon name="plus" size={18} weight="bold" /></button>
        </div>
        <small className="muted">Con 0 € la categoría no tiene límite.</small>
      </div>

      <div className="field">
        <span className="field__label">Color</span>
        <div className="swatches" role="radiogroup" aria-label="Color">
          {COLOR_SLOTS.map((slot) => (
            <button key={slot} role="radio" aria-checked={color === slot} className={`swatch ${color === slot ? 'is-active' : ''}`} style={{ '--c': `var(--cat-${slot})` }} onClick={() => setColor(slot)} aria-label={`Color ${slot + 1}`} />
          ))}
        </div>
      </div>

      <div className="field">
        <span className="field__label">Icono</span>
        <div className="icongrid" role="radiogroup" aria-label="Icono">
          {CATEGORY_ICON_CHOICES.map((key) => (
            <button key={key} role="radio" aria-checked={icon === key} className={`icongrid__item ${icon === key ? 'is-active' : ''}`} style={{ '--c': `var(--cat-${color})` }} onClick={() => setIcon(key)} aria-label={key}>
              <Icon name={key} size={22} weight={icon === key ? 'duotone' : 'regular'} />
            </button>
          ))}
        </div>
      </div>
    </Sheet>
  );
}
