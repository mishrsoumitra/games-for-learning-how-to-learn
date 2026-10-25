import { useSyncExternalStore } from 'react';
import type { z } from 'zod';
import { deleteDatabase, getDb, type StoreName } from './db.ts';
import {
  CardSchema,
  DeckSchema,
  MnemonicSchema,
  RunSchema,
  SettingsSchema,
  type Card,
  type Deck,
  type Mnemonic,
  type Run,
  type Settings,
} from './schemas.ts';

type Listener = () => void;

/** A partial settings object where a key may also be explicitly undefined (left unchanged). */
export type SettingsPatch = { [K in keyof Settings]?: Settings[K] | undefined };

/**
 * An in-memory copy of one object store, written through to IndexedDB. Components read it
 * with useSyncExternalStore, so a change re-renders only the screens that use that store.
 * If IndexedDB is not available (some private windows), the app keeps working in memory
 * and says so.
 */
class Collection<T extends { id: string }> {
  readonly store: StoreName;
  private readonly schema: z.ZodType<T>;
  private items = new Map<string, T>();
  private snapshot: readonly T[] = [];
  private listeners = new Set<Listener>();

  constructor(store: StoreName, schema: z.ZodType<T>) {
    this.store = store;
    this.schema = schema;
  }

  async load(): Promise<void> {
    const db = await getDb();
    const rows = await db.getAll(this.store);
    this.items = new Map();
    for (const row of rows) {
      const parsed = this.schema.safeParse(row);
      if (parsed.success) this.items.set(parsed.data.id, parsed.data);
      else console.warn(`Dropped a bad ${this.store} record`, parsed.error.issues[0]);
    }
    this.refresh();
  }

  loadFromMemory(rows: readonly T[]): void {
    this.items = new Map(rows.map((r) => [r.id, r]));
    this.refresh();
  }

  all(): readonly T[] {
    return this.snapshot;
  }

  get(id: string): T | undefined {
    return this.items.get(id);
  }

  subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  async put(item: T): Promise<T> {
    const parsed = this.schema.parse(item);
    this.items.set(parsed.id, parsed);
    this.refresh();
    await persist(async (db) => {
      await db.put(this.store, parsed as never);
    });
    return parsed;
  }

  async putMany(list: readonly T[]): Promise<void> {
    const parsedList = list.map((i) => this.schema.parse(i));
    for (const p of parsedList) this.items.set(p.id, p);
    this.refresh();
    await persist(async (db) => {
      const tx = db.transaction(this.store, 'readwrite');
      await Promise.all([...parsedList.map((p) => tx.store.put(p as never)), tx.done]);
    });
  }

  async remove(id: string): Promise<void> {
    if (!this.items.delete(id)) return;
    this.refresh();
    await persist(async (db) => {
      await db.delete(this.store, id);
    });
  }

  async removeMany(ids: readonly string[]): Promise<void> {
    let changed = false;
    for (const id of ids) changed = this.items.delete(id) || changed;
    if (!changed) return;
    this.refresh();
    await persist(async (db) => {
      const tx = db.transaction(this.store, 'readwrite');
      await Promise.all([...ids.map((id) => tx.store.delete(id)), tx.done]);
    });
  }

  async clear(): Promise<void> {
    this.items.clear();
    this.refresh();
    await persist(async (db) => {
      await db.clear(this.store);
    });
  }

  private refresh(): void {
    this.snapshot = Object.freeze([...this.items.values()]);
    for (const l of this.listeners) l();
  }
}

type DataStatus = 'loading' | 'ready' | 'memory-only';

class StatusStore {
  private status: DataStatus = 'loading';
  private listeners = new Set<Listener>();
  get(): DataStatus {
    return this.status;
  }
  set(status: DataStatus): void {
    this.status = status;
    for (const l of this.listeners) l();
  }
  subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }
}

class SettingsStore {
  private value: Settings = SettingsSchema.parse({});
  private listeners = new Set<Listener>();

  async load(): Promise<void> {
    const db = await getDb();
    const row = await db.get('settings', 'settings');
    const parsed = SettingsSchema.safeParse(row?.value ?? {});
    this.value = parsed.success ? parsed.data : SettingsSchema.parse({});
    this.notify();
  }

  get(): Settings {
    return this.value;
  }

  subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  async update(patch: SettingsPatch): Promise<Settings> {
    const clean: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(patch)) if (v !== undefined) clean[k] = v;
    const next = SettingsSchema.parse({ ...this.value, ...clean });
    this.value = next;
    this.notify();
    await persist(async (db) => {
      await db.put('settings', { key: 'settings', value: next });
    });
    return next;
  }

  async updateTeacher(patch: Partial<Settings['teacher']>): Promise<Settings> {
    return this.update({ teacher: { ...this.value.teacher, ...patch } });
  }

  private notify(): void {
    for (const l of this.listeners) l();
  }
}

const status = new StatusStore();

async function persist(
  write: (db: Awaited<ReturnType<typeof getDb>>) => Promise<void>,
): Promise<void> {
  if (status.get() === 'memory-only') return;
  try {
    const db = await getDb();
    await write(db);
  } catch (error) {
    console.error('Could not save to IndexedDB; continuing in memory', error);
    status.set('memory-only');
  }
}

export const decks = new Collection<Deck>('decks', DeckSchema);
export const cards = new Collection<Card>('cards', CardSchema);
export const mnemonics = new Collection<Mnemonic>('mnemonics', MnemonicSchema);
export const runs = new Collection<Run>('runs', RunSchema);
export const settings = new SettingsStore();

let initPromise: Promise<void> | null = null;

/** Loads everything once. Safe to call many times. */
export function initData(): Promise<void> {
  if (!initPromise) {
    initPromise = (async () => {
      try {
        await Promise.all([
          decks.load(),
          cards.load(),
          mnemonics.load(),
          runs.load(),
          settings.load(),
        ]);
        status.set('ready');
      } catch (error) {
        console.error('IndexedDB is not available; data will not survive a reload', error);
        status.set('memory-only');
      }
    })();
  }
  return initPromise;
}

/** Wipes every store. Used by "Delete all my data" and by tests. */
export async function clearAllData(): Promise<void> {
  decks.loadFromMemory([]);
  cards.loadFromMemory([]);
  mnemonics.loadFromMemory([]);
  runs.loadFromMemory([]);
  if (status.get() !== 'memory-only') {
    try {
      await deleteDatabase();
    } catch (error) {
      console.error(error);
    }
  }
  initPromise = null;
  await initData();
}

export function useDataStatus(): DataStatus {
  return useSyncExternalStore(
    (l) => status.subscribe(l),
    () => status.get(),
    () => status.get(),
  );
}

export function useDecks(): readonly Deck[] {
  return useSyncExternalStore(
    (l) => decks.subscribe(l),
    () => decks.all(),
    () => decks.all(),
  );
}

export function useCards(): readonly Card[] {
  return useSyncExternalStore(
    (l) => cards.subscribe(l),
    () => cards.all(),
    () => cards.all(),
  );
}

export function useMnemonics(): readonly Mnemonic[] {
  return useSyncExternalStore(
    (l) => mnemonics.subscribe(l),
    () => mnemonics.all(),
    () => mnemonics.all(),
  );
}

export function useRuns(): readonly Run[] {
  return useSyncExternalStore(
    (l) => runs.subscribe(l),
    () => runs.all(),
    () => runs.all(),
  );
}

export function useSettings(): Settings {
  return useSyncExternalStore(
    (l) => settings.subscribe(l),
    () => settings.get(),
    () => settings.get(),
  );
}
