import { useState } from 'react';
import { db } from '../db';
import { classifyScreenshot } from '../api/classifyScreenshot';
import { checkCategoryAlert } from '../utils/alerts';

export default function ImportPanel({ categories, onAdded, onClose }) {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [status, setStatus] = useState('idle');
  const [detected, setDetected] = useState([]);
  const [error, setError] = useState(null);

  function handleFile(e) {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
    setDetected([]);
    setError(null);
    setStatus('idle');
  }

  async function handleClassify() {
    setStatus('loading');
    setError(null);
    try {
      const results = await classifyScreenshot(file, categories);
      setDetected(results.map((r) => ({ ...r, include: true })));
      setStatus('done');
    } catch {
      setError('No se ha podido leer la captura. Prueba con otra imagen o añade el gasto a mano.');
      setStatus('error');
    }
  }

  function updateLine(index, patch) {
    setDetected((lines) => lines.map((l, i) => (i === index ? { ...l, ...patch } : l)));
  }

  async function handleConfirm() {
    const toAdd = detected.filter((l) => l.include);
    if (toAdd.length === 0) return;

    await db.expenses.bulkAdd(
      toAdd.map((l) => ({
        amount: Number(l.amount),
        concept: l.concept,
        category: l.categoryId,
        date: l.date ? new Date(l.date) : new Date(),
      }))
    );

    const categoryIds = [...new Set(toAdd.map((l) => l.categoryId))];
    const alerts = (await Promise.all(categoryIds.map(checkCategoryAlert))).filter(Boolean);
    onAdded(alerts[0]);
    onClose();
  }

  return (
    <div className="import-panel">
      {!preview && (
        <label className="import-panel__dropzone">
          <input type="file" accept="image/*" onChange={handleFile} hidden />
          📷 Sube una captura de tus movimientos
        </label>
      )}

      {preview && status !== 'done' && (
        <div className="import-panel__preview">
          <img src={preview} alt="Captura seleccionada" />
          <button className="btn btn--primary" onClick={handleClassify} disabled={status === 'loading'}>
            {status === 'loading' ? 'Leyendo captura…' : 'Clasificar con IA'}
          </button>
          {error && <p className="import-panel__error">{error}</p>}
        </div>
      )}

      {status === 'done' && (
        <div className="import-panel__results">
          <p>Engra ha encontrado {detected.length} movimientos. Revísalos antes de guardarlos:</p>
          {detected.map((line, i) => (
            <div className="import-line" key={i}>
              <input
                type="checkbox"
                checked={line.include}
                onChange={(e) => updateLine(i, { include: e.target.checked })}
              />
              <input
                type="text"
                value={line.concept}
                onChange={(e) => updateLine(i, { concept: e.target.value })}
              />
              <input
                type="number"
                value={line.amount}
                onChange={(e) => updateLine(i, { amount: e.target.value })}
              />
              <select
                value={line.categoryId ?? ''}
                onChange={(e) => updateLine(i, { categoryId: Number(e.target.value) })}
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.icon} {c.name}</option>
                ))}
              </select>
            </div>
          ))}
          <button className="btn btn--primary" onClick={handleConfirm}>
            Añadir {detected.filter((l) => l.include).length} gastos
          </button>
        </div>
      )}
    </div>
  );
}
