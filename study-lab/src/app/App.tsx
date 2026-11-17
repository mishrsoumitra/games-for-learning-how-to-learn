import { createBrowserRouter, RouterProvider } from 'react-router';
import { Layout } from './Layout.tsx';
import { RouteError } from './RouteError.tsx';
import { Loading } from '../components/Loading.tsx';

const base = import.meta.env.BASE_URL.replace(/\/$/, '');

const router = createBrowserRouter(
  [
    {
      path: '/',
      Component: Layout,
      ErrorBoundary: RouteError,
      HydrateFallback: Loading,
      children: [
        { index: true, lazy: () => import('../features/home/HomePage.tsx').then(page) },
        {
          path: 'activities/interleaving',
          lazy: () => import('../activities/interleaving/InterleavingIntro.tsx').then(page),
        },
        {
          path: 'activities/interleaving/run/:runId',
          lazy: () => import('../activities/interleaving/InterleavingRun.tsx').then(page),
        },
        {
          path: 'activities/retrieval',
          lazy: () => import('../activities/retrieval/RetrievalIntro.tsx').then(page),
        },
        {
          path: 'activities/retrieval/run/:runId',
          lazy: () => import('../activities/retrieval/RetrievalRun.tsx').then(page),
        },
        {
          path: 'activities/spacing',
          lazy: () => import('../activities/spacing/SpacingIntro.tsx').then(page),
        },
        {
          path: 'activities/spacing/run/:runId',
          lazy: () => import('../activities/spacing/SpacingRun.tsx').then(page),
        },
        {
          path: 'activities/problems',
          lazy: () => import('../activities/problems/ProblemsIntro.tsx').then(page),
        },
        {
          path: 'activities/problems/run/:runId',
          lazy: () => import('../activities/problems/ProblemsRun.tsx').then(page),
        },
        { path: 'results', lazy: () => import('../features/results/ResultsPage.tsx').then(page) },
        {
          path: 'results/class',
          lazy: () => import('../features/results/ClassPage.tsx').then(page),
        },
        {
          path: 'results/:runId',
          lazy: () => import('../features/results/RunPage.tsx').then(page),
        },
        {
          path: 'flashcards',
          lazy: () => import('../features/flashcards/DecksPage.tsx').then(page),
        },
        {
          path: 'flashcards/:deckId',
          lazy: () => import('../features/flashcards/DeckPage.tsx').then(page),
        },
        {
          path: 'flashcards/:deckId/review',
          lazy: () => import('../features/flashcards/ReviewPage.tsx').then(page),
        },
        {
          path: 'mnemonics',
          lazy: () => import('../features/mnemonics/MnemonicsPage.tsx').then(page),
        },
        {
          path: 'mnemonics/quiz',
          lazy: () => import('../features/mnemonics/MnemonicQuizPage.tsx').then(page),
        },
        {
          path: 'mnemonics/new',
          lazy: () => import('../features/mnemonics/MnemonicEditorPage.tsx').then(page),
        },
        {
          path: 'mnemonics/:mnemonicId',
          lazy: () => import('../features/mnemonics/MnemonicEditorPage.tsx').then(page),
        },
        { path: 'guide', lazy: () => import('../features/guide/GuidePage.tsx').then(page) },
        {
          path: 'settings',
          lazy: () => import('../features/settings/SettingsPage.tsx').then(page),
        },
        { path: '*', lazy: () => import('../features/home/NotFoundPage.tsx').then(page) },
      ],
    },
  ],
  { basename: base },
);

function page(module: { default: React.ComponentType }): { Component: React.ComponentType } {
  return { Component: module.default };
}

export function App() {
  return <RouterProvider router={router} />;
}
