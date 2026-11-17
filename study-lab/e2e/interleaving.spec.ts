/* oxlint-disable no-await-in-loop -- the test answers eight paintings one after another */
import { expect, test } from '@playwright/test';

/**
 * Plays a whole Mixed-or-blocked run with the teacher settings turned down (four painters,
 * one second a painting, a five-second break) so it finishes in under a minute, and checks
 * that a result sheet with both conditions appears and lands in Results.
 */
test('a full interleaving run produces a result sheet', async ({ page }) => {
  test.setTimeout(180_000);
  await page.goto('./settings');
  await page.getByText('Teacher settings').click();
  await page.getByLabel('Seconds per painting').fill('1');
  await page.getByLabel('Number of painters').fill('4');
  await page.getByLabel(/Break before the painting test/).fill('5');
  await expect(page.getByLabel('Number of painters')).toHaveValue('4');

  await page.goto('./activities/interleaving');
  await page.getByRole('button', { name: 'Start now' }).click();
  await expect(page.getByText(/Phase 1/)).toBeVisible();

  // Phase 1: 12 paintings at 1 s each, then the prediction slider.
  await expect(
    page.getByRole('heading', { name: /How well do you know these 2 painters/ }),
  ).toBeVisible({ timeout: 30_000 });
  await page.getByRole('button', { name: /Lock it in and start phase 2/ }).click();
  await expect(page.getByText(/Phase 2/)).toBeVisible();
  await expect(
    page.getByRole('heading', { name: /How well do you know these 2 painters/ }),
  ).toBeVisible({ timeout: 30_000 });
  await page.getByRole('button', { name: 'Lock it in' }).click();

  // The break, then the test of 8 paintings.
  await expect(page.getByText(/Tap the bigger number/)).toBeVisible();
  await expect(page.getByText(/who painted this/)).toBeVisible({ timeout: 15_000 });
  for (let i = 0; i < 8; i++) {
    await expect(page.getByText(`${i + 1} of 8`)).toBeVisible();
    await page.getByRole('group', { name: 'Painters' }).getByRole('button').first().click();
    await page.getByRole('button', { name: 'Next painting' }).click();
  }

  await expect(page.getByRole('heading', { name: 'Your result' })).toBeVisible();
  await expect(page.getByText('Mixed', { exact: true }).first()).toBeVisible();
  await expect(page.getByText('Blocked', { exact: true }).first()).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Was it just easier items?' })).toBeVisible();

  await page.goto('./results');
  await expect(
    page.getByText(/1 of 1 run in the "felt worse, worked better" corner|0 of 1 run/),
  ).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Your finished runs' })).toBeVisible();
});
