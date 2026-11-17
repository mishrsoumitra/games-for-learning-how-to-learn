/* oxlint-disable no-await-in-loop -- one page, rendered at each size in turn */
// Renders public/icon.svg to the PNG sizes the web manifest and iOS need, using the Chrome
// that Playwright already drives for the end-to-end tests. Run: node scripts/make-icons.mjs
import { readFileSync, writeFileSync } from 'node:fs';
import { chromium } from '@playwright/test';

const svg = readFileSync(new URL('../public/icon.svg', import.meta.url), 'utf8');
const sizes = [
  { name: 'icon-180.png', size: 180, pad: 0 },
  { name: 'icon-192.png', size: 192, pad: 0 },
  { name: 'icon-512.png', size: 512, pad: 0 },
  // Maskable icons keep the mark inside the safe zone (80% of the canvas).
  { name: 'icon-512-maskable.png', size: 512, pad: 0.12 },
];

const browser = await chromium.launch({ channel: 'chrome' });
const page = await browser.newPage();
for (const { name, size, pad } of sizes) {
  const inner = Math.round(size * (1 - 2 * pad));
  const offset = Math.round(size * pad);
  await page.setViewportSize({ width: size, height: size });
  await page.setContent(
    `<!doctype html><html><body style="margin:0;background:#151C2A;width:${size}px;height:${size}px;overflow:hidden">` +
      `<div style="position:absolute;left:${offset}px;top:${offset}px;width:${inner}px;height:${inner}px">${svg.replace('<svg ', `<svg width="${inner}" height="${inner}" `)}</div></body></html>`,
  );
  const png = await page.screenshot({
    type: 'png',
    clip: { x: 0, y: 0, width: size, height: size },
  });
  writeFileSync(new URL(`../public/${name}`, import.meta.url), png);
  console.warn(`wrote public/${name}`);
}
await browser.close();
