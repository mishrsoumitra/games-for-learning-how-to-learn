import { beforeEach, describe, expect, it } from 'vitest';
import { nowIso } from '../lib/dates.ts';
import { buildBundle, importBundle, parseBundle, parseResultFile } from './exportImport.ts';
import { cards, clearAllData, decks, initData, runs, settings } from './repo.ts';
import type { Card, Deck } from './schemas.ts';

function deck(id: string, name: string): Deck {
  const t = nowIso();
  return { id, name, description: '', createdAt: t, updatedAt: t };
}

function card(id: string, deckId: string, front: string, back: string): Card {
  const t = nowIso();
  return {
    id,
    deckId,
    front,
    back,
    hint: '',
    mnemonicId: null,
    tags: [],
    createdAt: t,
    updatedAt: t,
    review: { due: t, intervalDays: 0, ease: 2.5, reps: 0, lapses: 0 },
  };
}

describe('repo', () => {
  beforeEach(async () => {
    await initData();
    await clearAllData();
  });

  it('stores and reads back validated records', async () => {
    await decks.put(deck('d1', 'Physics'));
    await cards.put(card('c1', 'd1', 'force', 'mass times acceleration'));
    expect(decks.all()).toHaveLength(1);
    expect(cards.get('c1')?.back).toBe('mass times acceleration');
  });

  it('rejects records that break the schema', async () => {
    await expect(decks.put(deck('d2', ''))).rejects.toThrow();
    await expect(cards.put(card('c9', 'd1', 'x'.repeat(5000), 'y'))).rejects.toThrow();
  });

  it('exports and re-imports a bundle, keeping the newer copy on merge', async () => {
    await decks.put(deck('d1', 'Old name'));
    const text = JSON.stringify(buildBundle());
    const parsed = parseBundle(text);
    expect(parsed.ok).toBe(true);
    if (!parsed.ok) return;
    const later = {
      ...deck('d1', 'New name'),
      updatedAt: new Date(Date.now() + 60_000).toISOString(),
    };
    await decks.put(later);
    await importBundle(parsed.value, 'merge');
    expect(decks.get('d1')?.name).toBe('New name');
    await importBundle(parsed.value, 'replace');
    expect(decks.get('d1')?.name).toBe('Old name');
  });

  it('refuses files that are not Study Lab files', () => {
    expect(parseBundle('not json').ok).toBe(false);
    expect(parseBundle('[]').ok).toBe(false);
    expect(parseBundle(JSON.stringify({ app: 'other' })).ok).toBe(false);
    expect(parseResultFile(JSON.stringify({ app: 'study-lab', kind: 'result' })).ok).toBe(false);
  });

  it('keeps the participant code on replace import', async () => {
    await settings.update({ participantCode: 'ABCD23' });
    const bundle = buildBundle();
    bundle.settings = { ...bundle.settings, participantCode: 'ZZZZ99' };
    await importBundle(bundle, 'replace');
    expect(settings.get().participantCode).toBe('ABCD23');
    expect(runs.all()).toHaveLength(0);
  });
});
