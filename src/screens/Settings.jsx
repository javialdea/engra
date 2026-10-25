import { useEffect, useState } from 'react';
import { db } from '../db';

export default function Settings({ onChanged }) {
  const [userName, setUserName] = useState('');
  const [alertThreshold, setAlertThreshold] = useState(1);

  useEffect(() => {
    db.settings.get('app').then((s) => {
      setUserName(s?.userName ?? '');
      setAlertThreshold(s?.alertThreshold ?? 1);
    });
  }, []);

  async function save() {
    await db.settings.put({ key: 'app', userName: userName.trim(), alertThreshold: Number(alertThreshold) });
    onChanged();
  }

  return (
    <div className="screen panel">
      <label className="field">
        <span>Tu nombre</span>
        <input type="text" value={userName} onChange={(e) => setUserName(e.target.value)} onBlur={save} />
      </label>

      <label className="field">
        <span>Avísame cuando supere el (% del presupuesto)</span>
        <input
          type="number"
          min="10"
          max="200"
          value={Math.round(alertThreshold * 100)}
          onChange={(e) => setAlertThreshold(Number(e.target.value) / 100)}
          onBlur={save}
        />
      </label>

      <p className="settings__hint">
        Engra vive en tu móvil: todos tus datos se guardan localmente en este dispositivo, no se suben a ningún
        sitio, salvo cuando usas "Desde captura", que manda solo esa imagen a clasificar.
      </p>
    </div>
  );
}
