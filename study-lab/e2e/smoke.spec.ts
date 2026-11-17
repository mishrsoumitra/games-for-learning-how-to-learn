import { expect, test } from '@playwright/test';

test.describe('app shell', () => {
  test('loads with a strict Content Security Policy and no console errors', async ({ page }) => {
    const errors: string[] = [];
    page.on('console', (m) => {
      if (m.type() === 'error') errors.push(m.text());
    });
    page.on('pageerror', (e) => errors.push(e.message));
    const response = await page.goto('./');
    expect(response?.ok()).toBe(true);
    expect(response?.headers()['content-security-policy']).toContain("script-src 'self'");
    expect(response?.headers()['x-frame-options']).toBe('DENY');
    const meta = page.locator('meta[http-equiv="Content-Security-Policy"]');
    await expect(meta).toHaveAttribute('content', /default-src 'self'/);
    await expect(page.getByRole('heading', { name: 'Study Lab' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Mixed or blocked' })).toBeVisible();
    expect(errors).toEqual([]);
  });

  test('navigates through the main pages', async ({ page }) => {
    await page.goto('./');
    const nav = page.getByRole('navigation', { name: 'Main' });
    await nav.getByRole('link', { name: 'Flashcards' }).click();
    await expect(page.getByRole('heading', { name: 'Your decks' })).toBeVisible();
    await nav.getByRole('link', { name: 'Mnemonics' }).click();
    await expect(page.getByRole('heading', { name: 'Your mnemonics' })).toBeVisible();
    await nav.getByRole('link', { name: 'Results' }).click();
    await expect(page.getByRole('heading', { name: 'Felt versus worked' })).toBeVisible();
    await nav.getByRole('link', { name: 'Guide' }).click();
    await expect(
      page.getByRole('heading', { name: 'How the activities were built' }),
    ).toBeVisible();
    await nav.getByRole('link', { name: 'Settings' }).click();
    await expect(page.getByRole('heading', { name: 'Settings' })).toBeVisible();
  });

  test('a deep link reloads to the right page', async ({ page }) => {
    await page.goto('./activities/retrieval');
    await expect(page.getByRole('heading', { name: 'Reread or recall' })).toBeVisible();
    await page.reload();
    await expect(page.getByRole('heading', { name: 'Reread or recall' })).toBeVisible();
  });

  test('makes no requests to other origins', async ({ page }) => {
    const foreign: string[] = [];
    page.on('request', (r) => {
      const url = new URL(r.url());
      if (url.hostname !== '127.0.0.1') foreign.push(r.url());
    });
    await page.goto('./');
    await page.getByRole('link', { name: 'Guide' }).click();
    await expect(page.getByRole('heading', { name: 'Sources' })).toBeVisible();
    expect(foreign).toEqual([]);
  });

  test('works at phone width without horizontal scroll', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 800 });
    await page.goto('./');
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
    );
    expect(overflow).toBe(false);
  });
});
