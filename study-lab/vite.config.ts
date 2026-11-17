import { createHash } from 'node:crypto';
import { readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { join, relative } from 'node:path';
import react from '@vitejs/plugin-react';
import { defineConfig, type Plugin } from 'vitest/config';

const BASE = '/study-lab/';

/**
 * Content Security Policy for the built page. The same policy is sent as a header from
 * site/vercel.json; the meta tag covers the case where the files are served from somewhere
 * that does not set headers. No inline scripts or styles are allowed. React sets styles
 * through the CSSOM, so a strict style-src is fine. The dev server is not covered because
 * the React Fast Refresh preamble is an inline script.
 */
export const CSP = [
  "default-src 'self'",
  "script-src 'self'",
  "style-src 'self'",
  "img-src 'self' data:",
  "font-src 'self'",
  "connect-src 'self'",
  "worker-src 'self'",
  "manifest-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  'upgrade-insecure-requests',
].join('; ');

/** Browsers ignore frame-ancestors in a meta tag and log a warning, so the meta copy omits it. */
const CSP_META = CSP.replace("frame-ancestors 'none'; ", '');

function cspPlugin(): Plugin {
  return {
    name: 'study-lab:csp',
    apply: 'build',
    transformIndexHtml: {
      order: 'post',
      handler: () => [
        {
          tag: 'meta',
          attrs: { 'http-equiv': 'Content-Security-Policy', content: CSP_META },
          injectTo: 'head-prepend',
        },
      ],
    },
  };
}

function listFiles(dir: string): string[] {
  const out: string[] = [];
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) out.push(...listFiles(full));
    else out.push(full);
  }
  return out;
}

/**
 * Writes a precaching service worker into the output folder after the bundle is written.
 * The worker source lives in sw/sw.js; this plugin fills in the asset list and a version
 * hash so a new build invalidates the old cache. No library is involved.
 */
function serviceWorkerPlugin(): Plugin {
  let outDir = 'dist';
  return {
    name: 'study-lab:service-worker',
    apply: 'build',
    configResolved(config) {
      outDir = config.build.outDir;
    },
    writeBundle() {
      const files = listFiles(outDir)
        .map((f) => relative(outDir, f).split('\\').join('/'))
        .filter((f) => f !== 'sw.js' && !f.endsWith('.map') && f !== 'robots.txt');
      const urls = files.map((f) => (f === 'index.html' ? BASE : BASE + f));
      const hash = createHash('sha256');
      for (const f of files.sort()) hash.update(f).update(readFileSync(join(outDir, f)));
      const version = hash.digest('hex').slice(0, 16);
      const template = readFileSync(join('sw', 'sw.js'), 'utf8');
      const source = template
        .replace('__VERSION__', JSON.stringify(version))
        .replace('__BASE__', JSON.stringify(BASE))
        .replace('__PRECACHE__', JSON.stringify(urls));
      writeFileSync(join(outDir, 'sw.js'), source);
    },
  };
}

export default defineConfig({
  base: BASE,
  plugins: [react(), cspPlugin(), serviceWorkerPlugin()],
  build: {
    target: 'es2022',
    sourcemap: false,
    cssCodeSplit: true,
    modulePreload: { polyfill: false },
    reportCompressedSize: true,
    rolldownOptions: {
      output: {
        codeSplitting: {
          groups: [
            { name: 'react', test: /node_modules[\\/](react|react-dom|scheduler)[\\/]/ },
            { name: 'router', test: /node_modules[\\/]react-router[\\/]/ },
            { name: 'vendor', test: /node_modules[\\/]/ },
          ],
        },
      },
    },
  },
  server: {
    headers: {
      'X-Content-Type-Options': 'nosniff',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
    },
  },
  preview: {
    headers: {
      'Content-Security-Policy': CSP,
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), payment=(), usb=()',
      'Cross-Origin-Opener-Policy': 'same-origin',
      'Cross-Origin-Resource-Policy': 'same-origin',
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['src/test/setup.ts'],
    include: ['src/**/*.test.{ts,tsx}'],
    restoreMocks: true,
    coverage: {
      provider: 'v8',
      include: ['src/**/*.{ts,tsx}'],
      exclude: ['src/**/*.test.{ts,tsx}', 'src/test/**', 'src/main.tsx'],
      // The engines, data layer and scheduler are covered by unit tests; the activity screens
      // are exercised end to end by Playwright, which this coverage does not see. These floors
      // stop coverage from falling, and should be raised as component tests are added.
      thresholds: { lines: 45, functions: 38, branches: 30, statements: 45 },
    },
  },
});
