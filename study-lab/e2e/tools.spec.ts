import { expect, test } from '@playwright/test';

test.describe('flashcards and mnemonics', () => {
  test('create a deck, add cards, review one, and the data survives a reload', async ({ page }) => {
    await page.goto('./flashcards');
    await page.getByLabel('Deck name').fill('Physics unit 2');
    await page.getByRole('button', { name: 'Create' }).click();
    await expect(page.getByRole('heading', { name: 'Physics unit 2' })).toBeVisible();

    await page.getByLabel('Cards to paste').fill('newton :: kg·m/s²\nohm :: V/A\njoule :: N·m');
    await page.getByRole('button', { name: 'Add these cards' }).click();
    await expect(page.getByText('Added 3 cards.')).toBeVisible();
    await expect(page.getByText('3 cards', { exact: true })).toBeVisible();

    await page.getByRole('link', { name: /Review 3 due cards/ }).click();
    await page.getByLabel(/Type your answer/).fill('kg·m/s²');
    await page.getByRole('button', { name: 'Show the answer' }).click();
    await page.getByRole('button', { name: /Good/ }).click();
    await expect(page.getByText('2 left')).toBeVisible();

    await page.reload();
    await expect(page.getByText(/left/)).toBeVisible();
    await page.goto('./flashcards');
    await expect(page.getByRole('link', { name: 'Physics unit 2' })).toBeVisible();
    await expect(page.getByText(/3 cards · 2 due now/)).toBeVisible();
  });

  test('create a mnemonic and quiz on it', async ({ page }) => {
    await page.goto('./mnemonics/new');
    await page.getByLabel(/short title/).fill('Planets in order');
    await page.getByLabel(/What kind of hook/).selectOption('acrostic');
    await page
      .getByLabel(/list to remember/)
      .fill('Mercury\nVenus\nEarth\nMars\nJupiter\nSaturn\nUranus\nNeptune');
    await expect(page.getByText('MVEMJSUN')).toBeVisible();
    await page.getByLabel(/^The sentence/).fill('My Very Educated Mother Just Served Us Noodles');
    await page.getByRole('button', { name: 'Save the mnemonic' }).click();
    await expect(page.getByRole('link', { name: 'Planets in order' })).toBeVisible();

    await page.getByRole('link', { name: 'Test me on them' }).click();
    await page.getByLabel('Your answer').fill('My Very Educated Mother Just Served Us Noodles');
    await page.getByRole('button', { name: 'Show what I saved' }).click();
    await page.getByRole('button', { name: 'Yes, it came back' }).click();
    await expect(page.getByRole('heading', { name: 'Quiz done' })).toBeVisible();
    await expect(page.getByText(/1 of 1 came back/)).toBeVisible();
  });

  test('refuses a file that is not a Study Lab backup', async ({ page }) => {
    await page.goto('./settings');
    const chooser = page.waitForEvent('filechooser');
    await page.getByRole('button', { name: 'Load a backup file' }).click();
    const fc = await chooser;
    await fc.setFiles({
      name: 'evil.json',
      mimeType: 'application/json',
      buffer: Buffer.from(
        JSON.stringify({ app: 'study-lab', kind: 'bundle', version: 1, decks: 'nope' }),
      ),
    });
    await page.getByRole('button', { name: /Add to what is here/ }).click();
    await expect(page.getByRole('status')).toContainText('Not a Study Lab backup');
  });
});
