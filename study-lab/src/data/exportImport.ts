import { nowIso } from '../lib/dates.ts';
import { cards, decks, mnemonics, runs, settings } from './repo.ts';
import {
  BundleSchema,
  DeckFileSchema,
  LIMITS,
  ResultFileSchema,
  firstIssue,
  type Bundle,
  type DeckFile,
  type ResultFile,
  type Run,
} from './schemas.ts';

export function buildBundle(): Bundle {
  return {
    app: 'study-lab',
    kind: 'bundle',
    version: 1,
    exportedAt: nowIso(),
    settings: settings.get(),
    decks: [...decks.all()],
    cards: [...cards.all()],
    mnemonics: [...mnemonics.all()],
    runs: [...runs.all()],
  };
}

export type ParseOutcome<T> = { ok: true; value: T } | { ok: false; error: string };

/** Parses JSON text safely. Rejects oversized text and anything that is not an object. */
export function parseJsonObject(text: string): ParseOutcome<unknown> {
  if (text.length > LIMITS.bundleBytes) {
    return { ok: false, error: 'That file is too big for the app to import.' };
  }
  try {
    const value: unknown = JSON.parse(text);
    if (typeof value !== 'object' || value === null || Array.isArray(value)) {
      return { ok: false, error: 'The file is not a Study Lab file.' };
    }
    return { ok: true, value };
  } catch {
    return { ok: false, error: 'The file is not valid JSON.' };
  }
}

export function parseBundle(text: string): ParseOutcome<Bundle> {
  const json = parseJsonObject(text);
  if (!json.ok) return json;
  const parsed = BundleSchema.safeParse(json.value);
  if (!parsed.success)
    return { ok: false, error: `Not a Study Lab backup: ${firstIssue(parsed.error)}` };
  return { ok: true, value: parsed.data };
}

export function parseResultFile(text: string): ParseOutcome<ResultFile> {
  const json = parseJsonObject(text);
  if (!json.ok) return json;
  const parsed = ResultFileSchema.safeParse(json.value);
  if (!parsed.success)
    return { ok: false, error: `Not a result file: ${firstIssue(parsed.error)}` };
  return { ok: true, value: parsed.data };
}

export function parseDeckFile(text: string): ParseOutcome<DeckFile> {
  const json = parseJsonObject(text);
  if (!json.ok) return json;
  const parsed = DeckFileSchema.safeParse(json.value);
  if (!parsed.success) return { ok: false, error: `Not a deck file: ${firstIssue(parsed.error)}` };
  return { ok: true, value: parsed.data };
}

export type ImportMode = 'merge' | 'replace';

export interface ImportSummary {
  decks: number;
  cards: number;
  mnemonics: number;
  runs: number;
}

function newer<T extends { updatedAt: string }>(a: T | undefined, b: T): T {
  if (!a) return b;
  return new Date(b.updatedAt).getTime() >= new Date(a.updatedAt).getTime() ? b : a;
}

/**
 * Brings a backup in. Merge keeps whichever copy of each record was changed most recently.
 * Replace wipes the current data first. Settings are only taken in replace mode, and the
 * participant code is kept either way because the class plot depends on it.
 */
export async function importBundle(bundle: Bundle, mode: ImportMode): Promise<ImportSummary> {
  if (mode === 'replace') {
    await Promise.all([decks.clear(), cards.clear(), mnemonics.clear(), runs.clear()]);
    if (bundle.settings) {
      const { participantCode: _ignored, ...rest } = bundle.settings;
      await settings.update(rest);
    }
  }
  const deckList = bundle.decks.map((d) => newer(decks.get(d.id), d));
  const cardList = bundle.cards.map((c) => newer(cards.get(c.id), c));
  const mnemonicList = bundle.mnemonics.map((m) => newer(mnemonics.get(m.id), m));
  const runList = bundle.runs.map((r) => newer(runs.get(r.id), r));
  await Promise.all([
    decks.putMany(deckList),
    cards.putMany(cardList),
    mnemonics.putMany(mnemonicList),
    runs.putMany(runList),
  ]);
  return {
    decks: deckList.length,
    cards: cardList.length,
    mnemonics: mnemonicList.length,
    runs: runList.length,
  };
}

export function buildResultFile(run: Run): ResultFile | null {
  if (!run.result || !run.completedAt) return null;
  return {
    app: 'study-lab',
    kind: 'result',
    version: 1,
    participantCode: settings.get().participantCode,
    activity: run.activity,
    completedAt: run.completedAt,
    offSchedule: run.offSchedule,
    result: run.result,
  };
}
