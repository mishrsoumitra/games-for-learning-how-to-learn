// Draws four paintings by each of the twelve painters on one page and saves a screenshot, so
// the stimulus set can be checked by eye: each painter should look like itself, and some
// pairs should be easy to confuse. Run: node scripts/painter-sheet.mjs out.png
import { writeFileSync } from 'node:fs';
import { chromium } from '@playwright/test';
import { CANVAS, PAINTERS, paintingFor, paintingSeed } from '../src/content/painters.ts';

const out = process.argv[2] ?? 'painters.png';

function shapeToSvg(s, outline) {
  const fill = outline ? 'none' : s.color;
  const stroke = outline || s.kind === 'arc' ? s.color : 'none';
  switch (s.kind) {
    case 'circle':
      return `<circle cx="${s.cx}" cy="${s.cy}" r="${s.r}" fill="${fill}" stroke="${stroke}" stroke-width="${s.stroke}"/>`;
    case 'rect':
      return `<rect x="${s.x}" y="${s.y}" width="${s.w}" height="${s.h}" fill="${fill}" stroke="${stroke}" stroke-width="${s.stroke}" transform="rotate(${s.rotate.toFixed(1)} ${(s.x + s.w / 2).toFixed(1)} ${(s.y + s.h / 2).toFixed(1)})"/>`;
    case 'triangle':
      return `<polygon points="${s.points}" fill="${fill}" stroke="${stroke}" stroke-width="${s.stroke}" stroke-linejoin="round"/>`;
    case 'arc':
      return `<path d="${s.d}" fill="none" stroke="${s.color}" stroke-width="${s.stroke}" stroke-linecap="round"/>`;
    default:
      return '';
  }
}

let html =
  '<!doctype html><html><body style="margin:0;padding:16px;background:#E2E5E9;font:14px Jost,sans-serif;color:#151C2A">';
for (const painter of PAINTERS) {
  html += `<div style="display:flex;align-items:center;gap:10px;margin-bottom:10px"><div style="width:120px"><b>${painter.name}</b><br><small>${painter.shape}, ${painter.palette}, ${painter.layout}, ${painter.fill}</small></div>`;
  for (let i = 0; i < 4; i++) {
    const p = paintingFor(painter, paintingSeed(2026, painter.id, i));
    html += `<svg width="130" height="130" viewBox="0 0 ${CANVAS} ${CANVAS}" style="border-radius:4px;box-shadow:0 2px 6px rgba(0,0,0,.2)"><rect width="${CANVAS}" height="${CANVAS}" fill="${p.background}"/>${p.shapes.map((s) => shapeToSvg(s, p.fill === 'outline')).join('')}</svg>`;
  }
  html += '</div>';
}
html += '</body></html>';

const browser = await chromium.launch({ channel: 'chrome' });
const page = await browser.newPage({ viewport: { width: 720, height: 1800 } });
await page.setContent(html);
const png = await page.screenshot({ fullPage: true, type: 'png' });
writeFileSync(out, png);
await browser.close();
console.warn(`wrote ${out}`);
