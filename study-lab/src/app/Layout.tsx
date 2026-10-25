import { Suspense, useEffect } from 'react';
import { Link, NavLink, Outlet, ScrollRestoration, useLocation } from 'react-router';
import { Loading } from '../components/Loading.tsx';
import { useDataStatus } from '../data/repo.ts';
import { applyUpdate, useUpdateReady } from './serviceWorker.ts';
import { useThemeSync } from './theme.ts';

const NAV = [
  { to: '/', label: 'Home', end: true },
  { to: '/flashcards', label: 'Flashcards' },
  { to: '/mnemonics', label: 'Mnemonics' },
  { to: '/results', label: 'Results' },
  { to: '/guide', label: 'Guide' },
  { to: '/settings', label: 'Settings' },
];

export function Layout() {
  useThemeSync();
  const status = useDataStatus();
  const updateReady = useUpdateReady();
  const location = useLocation();

  useEffect(() => {
    // Move keyboard focus to the page content on navigation, for screen readers.
    const main = document.getElementById('main');
    if (main && location.pathname !== '/') main.focus({ preventScroll: true });
  }, [location.pathname]);

  return (
    <>
      <a className="skip-link" href="#main">
        Skip to the content
      </a>
      <header className="app-header">
        <div className="app-header-inner">
          <Link className="brand" to="/">
            Study Lab
          </Link>
          <nav className="nav" aria-label="Main">
            {NAV.map((item) => (
              <NavLink key={item.to} to={item.to} end={item.end ?? false}>
                {item.label}
              </NavLink>
            ))}
          </nav>
        </div>
      </header>
      <main id="main" tabIndex={-1}>
        {status === 'memory-only' && (
          <div className="notice notice-warn" role="status">
            This browser is not letting the app save anything. You can still do an activity, but
            your results will be gone when you close the tab. Try a normal window instead of a
            private one.
          </div>
        )}
        {updateReady && (
          <div className="notice row row-between" role="status">
            <span>A new version of Study Lab is ready.</span>
            <button type="button" className="btn btn-sm" onClick={applyUpdate}>
              Update now
            </button>
          </div>
        )}
        {status === 'loading' ? (
          <Loading />
        ) : (
          <Suspense fallback={<Loading />}>
            <Outlet />
          </Suspense>
        )}
      </main>
      <footer className="app-footer">
        <div className="app-footer-inner">
          <span>
            Learning How to Learn · Newton School of Technology. Your results stay on this device.
            Nothing is sent anywhere.
          </span>
          <Link to="/guide">How the activities were built</Link>
        </div>
      </footer>
      <ScrollRestoration />
    </>
  );
}
