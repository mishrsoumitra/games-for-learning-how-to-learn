import { useEffect } from 'react';
import { settings, useSettings } from '../data/repo.ts';
import type { Theme } from '../data/schemas.ts';

const STORAGE_KEY = 'study-lab:theme';

export function applyTheme(theme: Theme): void {
  const html = document.documentElement;
  if (theme === 'system') html.removeAttribute('data-theme');
  else html.setAttribute('data-theme', theme);
  try {
    if (theme === 'system') localStorage.removeItem(STORAGE_KEY);
    else localStorage.setItem(STORAGE_KEY, theme);
  } catch {
    // Storage may be blocked. The attribute still applies for this page view.
  }
}

/** Keeps the document in step with the saved theme. */
export function useThemeSync(): void {
  const { theme } = useSettings();
  useEffect(() => {
    applyTheme(theme);
  }, [theme]);
}

export function setTheme(theme: Theme): void {
  applyTheme(theme);
  void settings.update({ theme });
}
