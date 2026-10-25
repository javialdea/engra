import { useMemo, useState } from 'react';
import { useData } from '../data/DataProvider.jsx';
import Confetti from '../components/Confetti.jsx';
import Engra from '../components/Engra.jsx';
import Guilloche from '../components/Guilloche.jsx';
import Icon from '../components/Icon.jsx';
import Medallion from '../components/Medallion.jsx';
import { applyOnboarding } from '../data/actions.js';
import { formatSmart } from '../lib/format.js';
import { TONES, fill } from '../lib/voice.js';

const TONE_MOOD = { warm: 'happy', formal: 'watchful', witty: 'stern' };
const STEPS = 5;

/** Primera vez: Engra se presenta, pregunta el nombre, el presupuesto y cómo quieres que te hable. */
export default function Onboarding() {
  const { categories } = useData();
  const [step, setStep] = useState(0);
  const [name, setName] = useState('');
  const [budget, setBudget] = useState(900);
  const [tone, setTone] = useState('warm');
  const [busy, setBusy] = useState(false);

  const total = categories.reduce((acc, c) => acc + (c.budget || 0), 0) || 1;
  const split = useMemo(
    () => categories.filter((c) => c.budget > 0).map((c) => ({ ...c, share: Math.round((((c.budget / total) * budget) / 5)) * 5 })),
    [categories, total, budget],
  );

  const next = () => setStep((s) => Math.min(s + 1, STEPS - 1));
  const finish = async () => {
    setBusy(true);
    await applyOnboarding({ userName: name, tone, monthlyBudget: budget });
  };

  return (
    <div className="onboard">
      <Guilloche className="onboard__pattern" size={520} />
      <div className="onboard__dots" aria-hidden="true">
        {Array.from({ length: STEPS }, (_, i) => (
          <i key={i} className={i <= step ? 'is-on' : ''} />
        ))}
      </div>

      <div className="onboard__stage" key={step}>
        <div className="onboard__engra">
          <Engra mood={step === 3 && tone === 'witty' ? 'watchful' : 'happy'} size={190} view="14 0 172 172" />
        </div>

        <div className="onboard__card glass rise">
          {step === 0 && (
            <>
              <p className="voice onboard__say">Buenas. Soy Engra, tu banquera de bolsillo. Llevo las cuentas con cariño… y con lupa.</p>
              <p className="muted">Apuntas lo que gastas, te marco los límites y te aviso antes de que te pases. ¿Empezamos?</p>
              <button className="btn btn--primary btn--block" onClick={next}>Empezar</button>
            </>
          )}

          {step === 1 && (
            <>
              <p className="voice onboard__say">¿Cómo te llamo?</p>
              <label className="field field--icon">
                <Icon name="user" size={18} />
                <input autoFocus value={name} onChange={(e) => setName(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && next()} placeholder="Tu nombre" maxLength={20} autoComplete="given-name" aria-label="Tu nombre" />
              </label>
              <button className="btn btn--primary btn--block" onClick={next}>{name.trim() ? 'Seguir' : 'Prefiero no decirlo'}</button>
            </>
          )}

          {step === 2 && (
            <>
              <p className="voice onboard__say">{fill('¿Cuánto quieres gastar al mes, más o menos, {name}?', { name })}</p>
              <div className="budgetpick">
                <b className="display tnum">{formatSmart(budget)}</b>
                <input type="range" min="300" max="4000" step="50" value={budget} onChange={(e) => setBudget(Number(e.target.value))} aria-label="Presupuesto mensual" style={{ '--p': `${((budget - 300) / 3700) * 100}%` }} />
              </div>
              <ul className="budgetsplit">
                {split.map((c) => (
                  <li key={c.id}>
                    <i style={{ background: `var(--cat-${c.color})` }} />
                    <span>{c.name}</span>
                    <b className="tnum">{formatSmart(c.share)}</b>
                  </li>
                ))}
              </ul>
              <small className="muted">Lo reparto yo. Después puedes ajustar cada categoría.</small>
              <button className="btn btn--primary btn--block" onClick={next}>Seguir</button>
            </>
          )}

          {step === 3 && (
            <>
              <p className="voice onboard__say">¿Cómo prefieres que te hable?</p>
              <div className="tones" role="radiogroup" aria-label="Tono de Engra">
                {Object.entries(TONES).map(([key, t]) => (
                  <button key={key} role="radio" aria-checked={tone === key} className={`tone ${tone === key ? 'is-active' : ''}`} onClick={() => setTone(key)}>
                    <Medallion mood={TONE_MOOD[key]} size={42} animate={false} />
                    <span className="tone__text">
                      <b>{t.label}</b>
                      <q className="voice">{fill(t.sample, { name })}</q>
                    </span>
                    {tone === key && <Icon name="checkCircle" size={22} weight="fill" className="tone__check" />}
                  </button>
                ))}
              </div>
              <button className="btn btn--primary btn--block" onClick={next}>Seguir</button>
            </>
          )}

          {step === 4 && (
            <>
              <p className="voice onboard__say">{fill('Todo listo, {name}. Desde hoy, tus cuentas están en buenas manos.', { name })}</p>
              <p className="muted">Pulsa el botón dorado de abajo cada vez que gastes algo. Yo me encargo de lo demás.</p>
              <button className="btn btn--primary btn--block" disabled={busy} onClick={finish}>Entrar</button>
              <Confetti />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
