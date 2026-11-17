import { render } from '@testing-library/react';
import type { ReactNode } from 'react';
import { createMemoryRouter, RouterProvider, type RouteObject } from 'react-router';
import { clearAllData, initData } from '../data/repo.ts';

interface Options {
  /** The route pattern, when the URL has parameters, e.g. "/flashcards/:deckId". */
  routePath?: string;
  extraRoutes?: RouteObject[];
}

/** Renders a page inside a memory router at the given URL, with extra routes if needed. */
export function renderAt(url: string, element: ReactNode, options: Options = {}) {
  const router = createMemoryRouter(
    [{ path: options.routePath ?? url, element }, ...(options.extraRoutes ?? [])],
    { initialEntries: [url] },
  );
  return { router, ...render(<RouterProvider router={router} />) };
}

export async function freshData(): Promise<void> {
  await initData();
  await clearAllData();
}
