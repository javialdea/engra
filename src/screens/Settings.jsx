import { useRef, useState } from 'react';
import { useData } from '../data/DataProvider.jsx';
import { useUi } from '../ui/UiContext.jsx';
import Icon from '../components/Icon.jsx';
import Medallion from '../components/Medallion.jsx';
import { exportAllData, importAllData, resetAllData, updateSettings } from '../data/actions.js';
import { ACCENTS } from '../lib/catalog.js';
import { buildCsv, parseBackup } from '../lib/backupCore.js';
import { downloadFile } from '../lib/download.js';
import { toInputDate } from '../lib/format.js';
import { TONES, fill } from '../lib/voice.js';

const TONE_MOOD = { warm: 'happy', formal: 'watchful', witty: 'stern' };

function Group({ title, children, i = 0 }) {
  return (
    <section className="group rise" style={{ '--i': i }}>
      <h2 className="eyebrow">{title}</h2>
      <div className="card glass">{children}</div>
    </section>
  );
}

export default function Settings() {
  const { settings, expenses, categories, goals } = useData();
  const ui = useUi();
  const fileRef = useRef(null);
  const [name, setName] = useState(settings.userName);
  const [pending, setPending] = useState(null);
  const [error, setError] = useState('');
  const [confirmReset, setConfirmReset] = useState(false);
  const pct = Math.round(settings.alertThreshold * 100);

  const saveName = () => {
    const clean = name.trim();
    if (clean !== settings.userName) updateSettings({ userName: clean });
  };

  const backup = async () => {
    const data = await exportAllData();
    downloadFile(`engra-copia-${toInputDate(new Date())}.json`, JSON.stringify(data, null, 2));
    ui.toast({ text: 'Copia de seguridad descargada. Guárdala bien.', mood: 'happy', duration: 2800 });
  };

  const csv = () => {
    downloadFile(`engra-gastos-${toInputDate(new Date())}.csv`, buildCsv(expenses, categories), 'text/csv');
  };

  const pickFile = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    try {
      setPending(parseBackup(await file.text()));
      setError('');
    } catch (err) {
      setPending(null);
      setError(err.message);
    }
  };

  const restore = async () => {
    await importAllData(pending);
    setPending(null);
    ui.toast({ text: 'Copia restaurada. Ya está todo como lo dejaste.', mood: 'happy', duration: 3000 });
  };

  const reset = async () => {
    await resetAllData();
    setConfirmReset(false);
  };

  return (
    <div className="screen settings">
      <header className="rise" style={{ '--i': 0 }}>
        <h1 className="display">Ajustes</h1>
      </header>

      <Group title="Tú" i={1}>
        <label className="field">
          <span className="field__label">¿Cómo te llamo?</span>
          <input value={name} onChange={(e) => setName(e.target.value)} onBlur={saveName} onKeyDown={(e) => e.key === 'Enter' && e.currentTarget.blur()} placeholder="Tu nombre" maxLength={20} autoComplete="given-name" />
        </label>
      </Group>

      <Group title="Cómo habla Engra" i={2}>
        <div className="tones" role="radiogroup" aria-label="Tono de Engra">
          {Object.entries(TONES).map(([key, tone]) => (
            <button key={key} role="radio" aria-checked={settings.tone === key} className={`tone ${settings.tone === key ? 'is-active' : ''}`} onClick={() => updateSettings({ tone: key })}>
              <Medallion mood={TONE_MOOD[key]} size={46} animate={false} />
              <span className="tone__text">
                <b>{tone.label}</b>
                <small>{tone.blurb}</small>
                <q className="voice">{fill(tone.sample, { name: settings.userName })}</q>
              </span>
              {settings.tone === key && <Icon name="checkCircle" size={22} weight="fill" className="tone__check" />}
            </button>
          ))}
        </div>

        <div className="field">
          <span className="field__label">
            Avisarme al llegar al <b className="tnum">{pct}%</b> del presupuesto
          </span>
          <input type="range" min="50" max="100" step="5" value={pct} onChange={(e) => updateSettings({ alertThreshold: Number(e.target.value) / 100 })} aria-label="Umbral de aviso" style={{ '--p': `${((pct - 50) / 50) * 100}%` }} />
          <small className="muted">Si te pasas del 100 %, Engra avisa siempre.</small>
        </div>
      </Group>

      <Group title="Aspecto" i={3}>
        <div className="field">
          <span className="field__label">Tema</span>
          <div className="seg glass" role="radiogroup" aria-label="Tema">
            {[['dark', 'moon', 'Oscuro'], ['light', 'sun', 'Claro']].map(([id, icon, label]) => (
              <button key={id} role="radio" aria-checked={settings.theme === id} className={settings.theme === id ? 'is-active' : ''} onClick={() => updateSettings({ theme: id })}>
                <Icon name={icon} size={16} weight="fill" /> {label}
              </button>
            ))}
          </div>
        </div>
        <div className="field">
          <span className="field__label">Color</span>
          <div className="accents" role="radiogroup" aria-label="Color de acento">
            {Object.entries(ACCENTS).map(([id, a]) => (
              <button key={id} role="radio" aria-checked={settings.accent === id} className={`accent ${settings.accent === id ? 'is-active' : ''}`} onClick={() => updateSettings({ accent: id })} style={{ background: `linear-gradient(135deg, ${a.swatch[0]}, ${a.swatch[1]} 55%, ${a.swatch[2]})` }}>
                <span>{a.label}</span>
              </button>
            ))}
          </div>
        </div>
        <div className="switchrow">
          <span>
            <b>Vibración</b>
            <small className="muted">Un toquecito al pulsar y al avisar</small>
          </span>
          <button role="switch" aria-checked={settings.haptics !== false} className="switch" onClick={() => updateSettings({ haptics: settings.haptics === false })} aria-label="Vibración" />
        </div>
      </Group>

      <Group title="Tus datos" i={4}>
        <p className="muted">
          Todo se guarda en este dispositivo. {expenses.length} gastos, {categories.length} categorías y {goals.length} objetivos.
        </p>
        <div className="actions">
          <button className="btn btn--ghost" onClick={backup}><Icon name="download" size={18} /> Copia de seguridad</button>
          <button className="btn btn--ghost" onClick={() => fileRef.current?.click()}><Icon name="upload" size={18} /> Restaurar copia</button>
          <button className="btn btn--ghost" onClick={csv} disabled={expenses.length === 0}><Icon name="export" size={18} /> Exportar a Excel (CSV)</button>
        </div>
        <input ref={fileRef} type="file" accept="application/json,.json" hidden onChange={pickFile} />
        {error && <p className="notice notice--warn">{error}</p>}
        {pending && (
          <div className="confirm">
            <p>
              La copia trae {pending.expenses.length} gastos, {pending.categories.length} categorías y {pending.savingsGoals.length} objetivos.
              <b> Sustituirá lo que tienes ahora.</b>
            </p>
            <div className="row">
              <button className="btn btn--ghost" onClick={() => setPending(null)}>Cancelar</button>
              <button className="btn btn--primary" onClick={restore}>Restaurar</button>
            </div>
          </div>
        )}
      </Group>

      <Group title="Zona delicada" i={5}>
        {confirmReset ? (
          <div className="confirm">
            <p>Se borrará <b>todo</b>: gastos, objetivos y ajustes. Hazte antes una copia si no estás segura.</p>
            <div className="row">
              <button className="btn btn--ghost" onClick={() => setConfirmReset(false)}>Cancelar</button>
              <button className="btn btn--danger" onClick={reset}>Borrar todo</button>
            </div>
          </div>
        ) : (
          <button className="btn btn--ghost btn--danger-text" onClick={() => setConfirmReset(true)}>
            <Icon name="trash" size={18} /> Borrar todos mis datos
          </button>
        )}
      </Group>

      <p className="about rise" style={{ '--i': 6 }}>Engra · tu banquera de bolsillo</p>
    </div>
  );
}
