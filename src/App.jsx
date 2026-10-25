import { useState, useCallback, useEffect } from 'react';
import Dashboard from './screens/Dashboard';
import Goals from './screens/Goals';
import Settings from './screens/Settings';
import BottomNav from './components/BottomNav';
import QuickAddSheet from './components/QuickAddSheet';
import Engra from './components/Engra';
import { db, ensureSeeded } from './db';

export default function App() {
  const [tab, setTab] = useState('dashboard');
  const [sheetOpen, setSheetOpen] = useState(false);
  const [categories, setCategories] = useState([]);
  const [refreshKey, setRefreshKey] = useState(0);
  const [ready, setReady] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    ensureSeeded().then(() => setReady(true));
  }, []);

  useEffect(() => {
    if (ready) {
      db.categories.toArray().then(setCategories);
    }
  }, [ready, refreshKey]);

  const bump = useCallback((alertMessage) => {
    setRefreshKey((k) => k + 1);
    if (alertMessage) {
      setToast(alertMessage);
      setTimeout(() => setToast(null), 4000);
    }
  }, []);

  if (!ready) return null;

  return (
    <div className="app">
      <main className="app__content">
        {tab === 'dashboard' && <Dashboard refreshKey={refreshKey} />}
        {tab === 'goals' && <Goals refreshKey={refreshKey} onChanged={bump} />}
        {tab === 'settings' && <Settings onChanged={bump} />}
      </main>

      <button className="fab" onClick={() => setSheetOpen(true)} aria-label="Añadir gasto">
        +
      </button>

      <QuickAddSheet open={sheetOpen} onClose={() => setSheetOpen(false)} categories={categories} onAdded={bump} />

      {toast && (
        <div className="toast">
          <Engra mood="stern" size={36} />
          <span>{toast}</span>
        </div>
      )}

      <BottomNav active={tab} onChange={setTab} />
    </div>
  );
}
