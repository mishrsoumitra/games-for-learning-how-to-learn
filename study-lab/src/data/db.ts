import { openDB, type DBSchema, type IDBPDatabase } from 'idb';
import type { Card, Deck, Mnemonic, Run } from './schemas.ts';

interface StudyLabDB extends DBSchema {
  decks: { key: string; value: Deck };
  cards: { key: string; value: Card; indexes: { byDeck: string } };
  mnemonics: { key: string; value: Mnemonic };
  runs: { key: string; value: Run; indexes: { byActivity: string } };
  settings: { key: string; value: { key: string; value: unknown } };
}

export type StoreName = 'decks' | 'cards' | 'mnemonics' | 'runs';

export const DB_NAME = 'study-lab';
export const DB_VERSION = 1;

let dbPromise: Promise<IDBPDatabase<StudyLabDB>> | null = null;

export function getDb(): Promise<IDBPDatabase<StudyLabDB>> {
  if (!dbPromise) {
    dbPromise = openDB<StudyLabDB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('decks'))
          db.createObjectStore('decks', { keyPath: 'id' });
        if (!db.objectStoreNames.contains('cards')) {
          const cards = db.createObjectStore('cards', { keyPath: 'id' });
          cards.createIndex('byDeck', 'deckId');
        }
        if (!db.objectStoreNames.contains('mnemonics')) {
          db.createObjectStore('mnemonics', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('runs')) {
          const runs = db.createObjectStore('runs', { keyPath: 'id' });
          runs.createIndex('byActivity', 'activity');
        }
        if (!db.objectStoreNames.contains('settings')) {
          db.createObjectStore('settings', { keyPath: 'key' });
        }
      },
      blocking() {
        // Another tab upgraded the database. Close so it can finish; the page reloads on next use.
        dbPromise?.then((db) => db.close()).catch(() => undefined);
        dbPromise = null;
      },
    });
  }
  return dbPromise;
}

/** For tests: forget the cached connection so a fresh database is opened. */
export function resetDbForTests(): void {
  dbPromise = null;
}

export async function deleteDatabase(): Promise<void> {
  const db = await getDb().catch(() => null);
  db?.close();
  dbPromise = null;
  await new Promise<void>((resolve, reject) => {
    const req = indexedDB.deleteDatabase(DB_NAME);
    req.addEventListener('success', () => resolve());
    req.addEventListener('error', () =>
      reject(req.error ?? new Error('Could not delete the database')),
    );
    req.addEventListener('blocked', () => resolve());
  });
}
