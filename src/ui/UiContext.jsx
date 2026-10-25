import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { useData } from '../data/DataProvider.jsx';
import { alertVoice, goalVoice } from '../lib/voice.js';

const UiContext = createContext(null);

/** Navegación, hojas inferiores, avisos y confeti. Un solo sitio para todo lo "global". */
export function UiProvider({ children }) {
  const { settings } = useData();
  const [tab, setTab] = useState('home');
  const [sheet, setSheet] = useState(null);
  const [toasts, setToasts] = useState([]);
  const [confetti, setConfetti] = useState(0);
  const [expenseFilter, setExpenseFilter] = useState(null);

  const haptic = useCallback(
    (pattern = 10) => {
      if (settings.haptics !== false) navigator.vibrate?.(pattern);
    },
    [settings.haptics],
  );

  const openSheet = useCallback((type, props = {}) => setSheet({ type, props, id: Date.now() }), []);
  const closeSheet = useCallback(() => setSheet(null), []);

  const toast = useCallback(({ text, mood = 'happy', duration = 4600 }) => {
    const id = Math.random().toString(36).slice(2);
    setToasts((list) => [...list.slice(-1), { id, text, mood }]);
    setTimeout(() => setToasts((list) => list.filter((t) => t.id !== id)), duration);
  }, []);

  const celebrate = useCallback(() => setConfetti((n) => n + 1), []);

  const notifyAlert = useCallback(
    (alert) => {
      if (!alert) return;
      const text = alertVoice({
        kind: alert.kind,
        tone: settings.tone,
        name: settings.userName,
        category: alert.category,
        pct: alert.pct,
        over: alert.over,
        seed: new Date().toDateString(),
      });
      toast({ text, mood: alert.mood });
      haptic([30, 40, 30]);
    },
    [settings.tone, settings.userName, toast, haptic],
  );

  const notifyGoal = useCallback(
    ({ goal, progress }) => {
      const kind = progress.done ? 'done' : 'contrib';
      const text = goalVoice({ kind, tone: settings.tone, name: settings.userName, goal: goal.name, pct: progress.pct });
      toast({ text, mood: 'happy' });
      if (progress.done) celebrate();
      haptic(progress.done ? [20, 30, 20, 30, 60] : 12);
    },
    [settings.tone, settings.userName, toast, celebrate, haptic],
  );

  const goExpenses = useCallback((categoryId = null) => {
    setExpenseFilter(categoryId);
    setTab('expenses');
  }, []);

  const value = useMemo(
    () => ({
      tab, setTab, sheet, openSheet, closeSheet, toasts, toast, confetti, celebrate,
      notifyAlert, notifyGoal, haptic, expenseFilter, setExpenseFilter, goExpenses,
    }),
    [tab, sheet, openSheet, closeSheet, toasts, toast, confetti, celebrate, notifyAlert, notifyGoal, haptic, expenseFilter, goExpenses],
  );

  return <UiContext.Provider value={value}>{children}</UiContext.Provider>;
}

export function useUi() {
  const value = useContext(UiContext);
  if (!value) throw new Error('useUi fuera de UiProvider');
  return value;
}
