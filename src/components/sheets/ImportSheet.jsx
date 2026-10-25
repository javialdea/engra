import { useEffect, useState } from 'react';
import Sheet from '../Sheet.jsx';
import Icon from '../Icon.jsx';
import { useData } from '../../data/DataProvider.jsx';
import { useUi } from '../../ui/UiContext.jsx';
import { addExpenses } from '../../data/actions.js';
import { classifyScreenshot, getAccessCode, saveAccessCode } from '../../api/classifyScreenshot.js';
import { formatCurrency, parseAmount } from '../../lib/format.js';

function parseLineDate(text) {
  const d = text ? new Date(text) : null;
  return d && !Number.isNaN(d.getTime()) ? d : new Date();
}

/** Importar movimientos desde una captura de la banca: la IA propone, tú confirmas. */
export default function ImportSheet({ onClose }) {
  const { categories } = useData();
  const ui = useUi();
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [step, setStep] = useState('pick');
  const [lines, setLines] = useState([]);
  const [error, setError] = useState('');
  const [code, setCode] = useState(getAccessCode);
  const [askCode, setAskCode] = useState(() => !getAccessCode());

  useEffect(() => () => preview && URL.revokeObjectURL(preview), [preview]);

  const choose = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
    setStep('ready');
    setError('');
  };

  const read = async () => {
    setStep('loading');
    setError('');
    saveAccessCode(code);
    try {
      const found = await classifyScreenshot(file, categories);
      if (found.length === 0) throw Object.assign(new Error('empty'), { status: 0 });
      setLines(found.map((l) => ({ ...l, include: true, amount: String(l.amount).replace('.', ',') })));
      setStep('review');
    } catch (err) {
      setStep('ready');
      if (err.status === 401) setAskCode(true);
      setError(
        err.status === 404 || err.status === 405
          ? 'La lectura con IA solo funciona con la app publicada en internet. Mientras tanto, apunta los gastos a mano.'
          : err.status === 401
            ? 'El código de acceso no es correcto.'
            : err.status === 503
              ? 'La IA todavía no está configurada en el servidor (falta la clave de Anthropic o el código de acceso).'
              : err.status === 429
                ? 'Demasiadas peticiones seguidas. Espera un minuto y vuelve a intentarlo.'
                : err.message === 'empty'
                  ? 'No he encontrado movimientos en esa imagen. Prueba con otra captura más clara.'
                  : 'No he podido leer la captura. Inténtalo de nuevo o apunta el gasto a mano.',
      );
    }
  };

  const update = (i, patch) => setLines((list) => list.map((l, idx) => (idx === i ? { ...l, ...patch } : l)));
  const chosen = lines.filter((l) => l.include && parseAmount(l.amount) > 0);

  const confirm = async (close) => {
    const alert = await addExpenses(
      chosen.map((l) => ({ amount: parseAmount(l.amount), concept: l.concept, category: l.categoryId, date: parseLineDate(l.date) })),
    );
    ui.toast({ text: `${chosen.length} ${chosen.length === 1 ? 'gasto añadido' : 'gastos añadidos'}.`, mood: 'happy', duration: 2400 });
    if (alert) setTimeout(() => ui.notifyAlert(alert), 600);
    close();
  };

  return (
    <Sheet
      onClose={onClose}
      size="tall"
      title="Desde una captura"
      footer={(close) =>
        step === 'review' ? (
          <button className="btn btn--primary btn--block" disabled={chosen.length === 0} onClick={() => confirm(close)}>
            Añadir {chosen.length} {chosen.length === 1 ? 'gasto' : 'gastos'} · {formatCurrency(chosen.reduce((a, l) => a + parseAmount(l.amount), 0))}
          </button>
        ) : step === 'pick' ? null : (
          <button className="btn btn--primary btn--block" disabled={step === 'loading'} onClick={read}>
            {step === 'loading' ? 'Engra está leyendo…' : 'Leer con IA'}
          </button>
        )
      }
    >
      {step === 'pick' && (
        <label className="dropzone">
          <input type="file" accept="image/*" onChange={choose} hidden />
          <span className="dropzone__icon"><Icon name="camera" size={34} weight="duotone" /></span>
          <strong>Sube una captura de tus movimientos</strong>
          <small>Engra los lee, los clasifica y tú confirmas antes de guardar nada.</small>
        </label>
      )}

      {(step === 'ready' || step === 'loading') && (
        <div className="import-preview">
          <img src={preview} alt="Captura seleccionada" />
          {step === 'loading' && <div className="scanline" aria-hidden="true" />}
          {askCode ? (
            <label className="field">
              <span className="field__label">Código de acceso</span>
              <input value={code} onChange={(e) => setCode(e.target.value)} placeholder="El que pusiste al publicar la app" type="password" autoComplete="off" />
              <small className="muted">Evita que otra persona use tu cuenta de IA. Se guarda solo en este dispositivo.</small>
            </label>
          ) : (
            <button className="link" onClick={() => setAskCode(true)}>Cambiar código de acceso</button>
          )}
          {error && <p className="notice notice--warn">{error}</p>}
        </div>
      )}

      {step === 'review' && (
        <div className="import-lines">
          <p className="muted">Revisa lo que ha encontrado. Puedes corregir importes y categorías.</p>
          {lines.map((l, i) => (
            <div key={i} className={`import-line ${l.include ? '' : 'is-off'}`}>
              <button className={`check ${l.include ? 'is-on' : ''}`} onClick={() => update(i, { include: !l.include })} aria-label="Incluir" aria-pressed={l.include}>
                {l.include && <Icon name="check" size={14} weight="bold" />}
              </button>
              <input className="field field--bare" value={l.concept} onChange={(e) => update(i, { concept: e.target.value })} aria-label="Concepto" />
              <input className="field field--bare field--amount" inputMode="decimal" value={l.amount} onChange={(e) => update(i, { amount: e.target.value })} aria-label="Importe" />
              <select className="field field--bare" value={l.categoryId ?? ''} onChange={(e) => update(i, { categoryId: Number(e.target.value) })} aria-label="Categoría">
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
          ))}
        </div>
      )}
    </Sheet>
  );
}
