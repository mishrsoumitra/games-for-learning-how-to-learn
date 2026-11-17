import { useSyncExternalStore } from 'react';

type Listener = () => void;
let waitingWorker: ServiceWorker | null = null;
const listeners = new Set<Listener>();

function notify(): void {
  for (const l of listeners) l();
}

/**
 * Registers the precaching worker in production builds only. When a new version is
 * waiting, the app shows a button; nothing reloads on its own, because a reload in the
 * middle of an activity would spoil the student's data.
 */
export function registerServiceWorker(): void {
  if (!import.meta.env.PROD || !('serviceWorker' in navigator)) return;
  window.addEventListener('load', () => {
    void register();
  });
}

async function register(): Promise<void> {
  try {
    const registration = await navigator.serviceWorker.register(
      `${import.meta.env.BASE_URL}sw.js`,
      {
        scope: import.meta.env.BASE_URL,
      },
    );
    if (registration.waiting && navigator.serviceWorker.controller) {
      waitingWorker = registration.waiting;
      notify();
    }
    registration.addEventListener('updatefound', () => {
      const installing = registration.installing;
      if (!installing) return;
      installing.addEventListener('statechange', () => {
        if (installing.state === 'installed' && navigator.serviceWorker.controller) {
          waitingWorker = installing;
          notify();
        }
      });
    });
  } catch (error) {
    console.warn('Service worker not registered', error);
  }
}

export function applyUpdate(): void {
  if (!waitingWorker) return;
  navigator.serviceWorker.addEventListener('controllerchange', () => window.location.reload(), {
    once: true,
  });
  waitingWorker.postMessage('skip-waiting');
}

export function useUpdateReady(): boolean {
  return useSyncExternalStore(
    (l) => {
      listeners.add(l);
      return () => listeners.delete(l);
    },
    () => waitingWorker !== null,
    () => false,
  );
}
