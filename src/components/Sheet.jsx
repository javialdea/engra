import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import Icon from './Icon.jsx';

const SheetContext = createContext(() => {});
/** Cierra la hoja con animación desde cualquier contenido. */
export const useSheetClose = () => useContext(SheetContext);

/** Hoja inferior con cristal, arrastrable hacia abajo para cerrar. */
export default function Sheet({ onClose, title, children, footer, actions, size = 'auto' }) {
  const [closing, setClosing] = useState(false);
  const ref = useRef(null);
  const drag = useRef({ y0: 0, dy: 0, active: false });

  const close = useCallback(() => {
    setClosing(true);
    setTimeout(onClose, 220);
  }, [onClose]);

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && close();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [close]);

  const down = (e) => {
    drag.current = { y0: e.clientY, dy: 0, active: true };
    e.currentTarget.setPointerCapture(e.pointerId);
    if (ref.current) ref.current.style.transition = 'none';
  };
  const move = (e) => {
    if (!drag.current.active || !ref.current) return;
    const dy = Math.max(0, e.clientY - drag.current.y0);
    drag.current.dy = dy;
    ref.current.style.transform = `translateY(${dy}px)`;
  };
  const up = () => {
    if (!drag.current.active || !ref.current) return;
    drag.current.active = false;
    ref.current.style.transition = '';
    if (drag.current.dy > 110) close();
    else ref.current.style.transform = '';
  };

  return (
    <SheetContext.Provider value={close}>
      <div className={`sheet-backdrop ${closing ? 'is-closing' : ''}`} onClick={close}>
        <section
          ref={ref}
          className={`sheet sheet--${size}`}
          role="dialog"
          aria-modal="true"
          aria-label={title}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="sheet__grab" onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={up}>
            <span />
          </div>
          <header className="sheet__head">
            <h2 className="display">{title}</h2>
            <div className="sheet__actions">
              {actions}
              <button className="icon-btn" onClick={close} aria-label="Cerrar">
                <Icon name="x" size={18} weight="bold" />
              </button>
            </div>
          </header>
          <div className="sheet__body scroll-y">{typeof children === 'function' ? children(close) : children}</div>
          {footer && <footer className="sheet__foot">{typeof footer === 'function' ? footer(close) : footer}</footer>}
        </section>
      </div>
    </SheetContext.Provider>
  );
}
