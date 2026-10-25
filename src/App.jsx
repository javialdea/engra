import { useEffect, useState } from 'react';
import { DataProvider, useData } from './data/DataProvider.jsx';
import { runRecurring } from './data/actions.js';
import { ensureSeeded } from './db.js';
import { UiProvider, useUi } from './ui/UiContext.jsx';
import { useTheme } from './hooks/useTheme.js';
import BottomNav from './components/BottomNav.jsx';
import Engra from './components/Engra.jsx';
import Toasts from './components/Toasts.jsx';
import SheetHost from './components/sheets/SheetHost.jsx';
import Expenses from './screens/Expenses.jsx';
import Goals from './screens/Goals.jsx';
import Home from './screens/Home.jsx';
import Onboarding from './screens/Onboarding.jsx';
import Settings from './screens/Settings.jsx';

const SCREENS = { home: Home, expenses: Expenses, goals: Goals, settings: Settings };

function Main() {
  const { tab, setTab, openSheet } = useUi();
  const Screen = SCREENS[tab];
  return (
    <>
      <main className="app__scroll scroll-y" key={tab}>
        <Screen />
      </main>
      <BottomNav tab={tab} onTab={setTab} onAdd={() => openSheet('expense')} />
      <SheetHost />
      <Toasts />
    </>
  );
}

function Shell() {
  const { settings } = useData();
  useTheme(settings);

  // Al volver a abrir la app, apunta los gastos fijos que hayan tocado mientras tanto.
  useEffect(() => {
    const onVisible = () => document.visibilityState === 'visible' && runRecurring();
    document.addEventListener('visibilitychange', onVisible);
    return () => document.removeEventListener('visibilitychange', onVisible);
  }, []);

  return (
    <div className="stage">
      <div className="app">{settings.onboarded ? <Main /> : <Onboarding />}</div>
    </div>
  );
}

export default function App() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    (async () => {
      await ensureSeeded();
      await runRecurring();
      setReady(true);
    })();
  }, []);

  if (!ready) {
    return (
      <div className="stage">
        <div className="app app--splash">
          <Engra mood="happy" size={120} view="14 0 172 172" />
        </div>
      </div>
    );
  }

  return (
    <DataProvider>
      <UiProvider>
        <Shell />
      </UiProvider>
    </DataProvider>
  );
}
