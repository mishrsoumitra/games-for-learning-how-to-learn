import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { FilePicker } from '../../components/FilePicker.tsx';
import { PageHead } from '../../components/PageHead.tsx';
import { useClock } from '../../components/useTicker.ts';
import { parseDeckFile } from '../../data/exportImport.ts';
import { cards, decks, useCards, useDecks } from '../../data/repo.ts';
import type { Deck, DeckFile } from '../../data/schemas.ts';
import { nowIso } from '../../lib/dates.ts';
import { newId } from '../../lib/ids.ts';
import { dueCards, freshReview } from './scheduler.ts';

async function createDeck(deckName: string, description = ''): Promise<Deck> {
  const t = nowIso();
  return decks.put({ id: newId(), name: deckName.trim(), description, createdAt: t, updatedAt: t });
}

async function importDeckFile(file: DeckFile): Promise<void> {
  const deck = await createDeck(file.name, file.description);
  const t = nowIso();
  await cards.putMany(
    file.cards.map((c) => ({
      id: newId(),
      deckId: deck.id,
      front: c.front,
      back: c.back,
      hint: c.hint,
      mnemonicId: null,
      tags: c.tags,
      createdAt: t,
      updatedAt: t,
      review: freshReview(),
    })),
  );
}

export default function DecksPage() {
  const deckList = useDecks();
  const cardList = useCards();
  const navigate = useNavigate();
  const now = useClock(60_000);
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  const rows = useMemo(() => {
    const nowDate = new Date(now);
    return [...deckList]
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
      .map((d) => {
        const own = cardList.filter((c) => c.deckId === d.id);
        return { deck: d, total: own.length, due: dueCards(own, nowDate).length };
      });
  }, [deckList, cardList, now]);

  return (
    <div className="stack-lg">
      <PageHead
        kicker="Flashcards"
        title="Your decks"
        lead="A deck is one subject or one chapter. Each card asks a question on the front and keeps the answer on the back. Review by typing the answer before you flip, because recalling is what makes it stick."
      />

      <section className="card stack">
        <h3>Make a deck</h3>
        <form
          className="row"
          onSubmit={async (e) => {
            e.preventDefault();
            if (name.trim() === '') return;
            const deck = await createDeck(name);
            setName('');
            void navigate(`/flashcards/${deck.id}`);
          }}
        >
          <input
            className="input"
            style={{ maxWidth: 360 }}
            placeholder="Deck name, e.g. Physics unit 2"
            value={name}
            maxLength={120}
            onChange={(e) => setName(e.target.value)}
            aria-label="Deck name"
          />
          <button type="submit" className="btn" disabled={name.trim() === ''}>
            Create
          </button>
          <FilePicker
            label="Load a deck file"
            multiple
            onText={async (texts) => {
              const parsed = texts.map((t) => parseDeckFile(t));
              const bad = parsed.find((p) => !p.ok);
              if (bad && !bad.ok) {
                setError(bad.error);
                return;
              }
              await Promise.all(
                parsed.map((p) => (p.ok ? importDeckFile(p.value) : Promise.resolve())),
              );
              setError('');
            }}
          />
        </form>
        {error !== '' && (
          <p className="error-text" role="alert">
            {error}
          </p>
        )}
      </section>

      {rows.length === 0 ? (
        <p className="empty">
          No decks yet. Make one above, and add cards from the chapter you are on this week.
        </p>
      ) : (
        <ul className="list">
          {rows.map(({ deck, total, due }) => (
            <li className="list-item" key={deck.id}>
              <div className="body">
                <div className="title">
                  <Link to={`/flashcards/${deck.id}`}>{deck.name}</Link>
                </div>
                <div className="meta">
                  {total} {total === 1 ? 'card' : 'cards'}
                  {due > 0 ? ` · ${due} due now` : total > 0 ? ' · nothing due' : ''}
                  {deck.description !== '' && ` · ${deck.description}`}
                </div>
              </div>
              {due > 0 ? (
                <Link className="btn btn-sm" to={`/flashcards/${deck.id}/review`}>
                  Review {due}
                </Link>
              ) : (
                <Link className="btn btn-sm btn-secondary" to={`/flashcards/${deck.id}`}>
                  Open
                </Link>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
