/* oxlint-disable no-await-in-loop -- one browser, pages captured in turn */
// Captures the main screens in both themes at desktop and phone widths from a running
// preview server (npx vite preview --port 4173). Output goes to the folder given as the first
// argument. Run: node scripts/screenshots.mjs /path/to/folder
import { mkdirSync } from 'node:fs';
import { chromium } from '@playwright/test';

const out = process.argv[2] ?? 'screenshots';
mkdirSync(out, { recursive: true });
const base = 'http://127.0.0.1:4173/study-lab/';
const pages = [
  ['home', ''],
  ['interleaving-intro', 'activities/interleaving'],
  ['spacing-intro', 'activities/spacing'],
  ['flashcards', 'flashcards'],
  ['mnemonic-new', 'mnemonics/new'],
  ['results', 'results'],
  ['guide', 'guide'],
  ['settings', 'settings'],
];

const browser = await chromium.launch({ channel: 'chrome' });
for (const scheme of ['light', 'dark']) {
  for (const [label, width] of [
    ['desktop', 1100],
    ['phone', 390],
  ]) {
    const context = await browser.newContext({
      colorScheme: scheme,
      viewport: { width, height: 900 },
      deviceScaleFactor: 1,
    });
    const page = await context.newPage();
    for (const [name, path] of pages) {
      await page.goto(base + path, { waitUntil: 'networkidle' });
      await page.waitForTimeout(400);
      await page.screenshot({ path: `${out}/${name}-${scheme}-${label}.png`, fullPage: true });
    }
    await context.close();
  }
}
await browser.close();
console.warn(`wrote screenshots to ${out}`);
