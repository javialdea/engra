import { useEffect } from 'react';

/** Aplica tema y color de acento al documento y avisa al navegador (barra de estado). */
export function useTheme(settings) {
  useEffect(() => {
    const root = document.documentElement;
    const theme = settings.theme === 'light' ? 'light' : 'dark';
    const accent = settings.accent || 'emerald';
    root.dataset.theme = theme;
    root.dataset.accent = accent;
    try {
      localStorage.setItem('engra-look', JSON.stringify({ theme, accent }));
    } catch {
      // sin almacenamiento local no pasa nada: solo se pierde evitar un parpadeo al abrir
    }
    const bg = getComputedStyle(root).getPropertyValue('--bg').trim();
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', bg || '#04100b');
  }, [settings.theme, settings.accent]);
}
