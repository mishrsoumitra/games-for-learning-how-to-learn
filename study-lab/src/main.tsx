import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './app/App.tsx';
import { registerServiceWorker } from './app/serviceWorker.ts';
import { initData } from './data/repo.ts';
import './styles/index.css';

const root = document.getElementById('root');
if (!root) throw new Error('Missing #root');

void initData();

createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

registerServiceWorker();
