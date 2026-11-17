import { slugify } from './text.ts';

/** Saves text to the student's device as a file. Nothing leaves the browser. */
export function downloadText(name: string, text: string, type = 'application/json'): void {
  const blob = new Blob([text], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  a.rel = 'noopener';
  document.body.append(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function fileName(base: string, ext: string): string {
  const stamp = new Date().toISOString().slice(0, 10);
  return `${slugify(base)}-${stamp}.${ext}`;
}

/** Turns rows into CSV with every cell quoted, so commas, quotes and newlines are safe. */
export function toCsv(rows: readonly (readonly (string | number | boolean | null)[])[]): string {
  return rows
    .map((row) =>
      row
        .map((cell) => {
          const s = cell === null ? '' : String(cell);
          // A leading =, +, - or @ could be read as a formula by a spreadsheet. Prefix it.
          const safe = /^[=+\-@\t\r]/.test(s) ? `'${s}` : s;
          return `"${safe.replace(/"/g, '""')}"`;
        })
        .join(','),
    )
    .join('\r\n');
}

export async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

/** Reads a file the student picked, refusing anything over the size limit. */
export function readTextFile(file: File, maxBytes = 5 * 1024 * 1024): Promise<string> {
  if (file.size > maxBytes) {
    return Promise.reject(
      new Error(`That file is too big. The limit is ${Math.round(maxBytes / 1024 / 1024)} MB.`),
    );
  }
  return file.text();
}
