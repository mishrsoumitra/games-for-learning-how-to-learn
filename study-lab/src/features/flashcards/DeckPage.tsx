import { memo, useDeferredValue, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router';
import { ConfirmDialog } from '../../components/Modal.tsx';
import { PageHead } from '../../components/PageHead.tsx';
import { useClock } from '../../components/useTicker.ts';
import { cards, decks, useCards, useDecks, useMnemonics } from '../../data/repo.ts';
import type { Card, DeckFile, Mnemonic } from '../../data/schemas.ts';
import { formatDate, nowIso } from '../../lib/dates.ts';
import { downloadText, fileName, toCsv } from '../../lib/download.ts';
import { newId } from '../../lib/ids.ts';
import { freshReview, isDue, parsePastedCards, touch } from './scheduler.ts';

export default function DeckPage() {
  const { deckId } = useParams();
  const deckList = useDecks();
  const allCards = useCards();
  const mnemonicList = useMnemonics();
  const navigate = useNavigate();
  const now = useClock(60_000);
  const deck = deckList.find((d) => d.id === deckId);
  const [search, setSearch] = useState('');
  const deferredSearch = useDeferredValue(search);
  const [front, setFront] = useState('');
  const [back, setBack] = useState('');
  const [hint, setHint] = useState('');
  const [paste, setPaste] = useState('');
  const [pasteMessage, setPasteMessage] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);

  const own = useMemo(
    () =>
      allCards
        .filter((c) => c.deckId === deckId)
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    [allCards, deckId],
  );
  const shown = useMemo(() => {
    const q = deferredSearch.trim().toLowerCase();
    if (q === '') return own;
    return own.filter(
      (c) =>
        c.front.toLowerCase().includes(q) ||
        c.back.toLowerCase().includes(q) ||
        c.tags.some((t) => t.toLowerCase().includes(q)),
    );
  }, [own, deferredSearch]);
  const due = useMemo(() => own.filter((c) => isDue(c, new Date(now))).length, [own, now]);

  if (!deck || !deckId) {
    return (
      <div className="narrow stack">
        <h1>That deck was not found</h1>
        <Link className="btn" to="/flashcards">
          Back to your decks
        </Link>
      </div>
    );
  }

  async function addCard(f: string, b: string, h = '') {
    const t = nowIso();
    await cards.put({
      id: newId(),
      deckId: deck?.id ?? '',
      front: f.trim(),
      back: b.trim(),
      hint: h.trim(),
      mnemonicId: null,
      tags: [],
      createdAt: t,
      updatedAt: t,
      review: freshReview(),
    });
    if (deck) await decks.put(touch(deck));
  }

  function exportJson() {
    const file: DeckFile = {
      app: 'study-lab',
      kind: 'deck',
      version: 1,
      name: deck?.name ?? 'deck',
      description: deck?.description ?? '',
      cards: own.map((c) => ({ front: c.front, back: c.back, hint: c.hint, tags: c.tags })),
    };
    downloadText(fileName(`deck-${file.name}`, 'json'), JSON.stringify(file, null, 2));
  }

  function exportCsv() {
    const rows = [
      ['front', 'back', 'hint', 'tags', 'due', 'interval_days', 'reviews', 'lapses'],
      ...own.map((c) => [
        c.front,
        c.back,
        c.hint,
        c.tags.join(' '),
        c.review.due,
        c.review.intervalDays,
        c.review.reps,
        c.review.lapses,
      ]),
    ];
    downloadText(fileName(`deck-${deck?.name ?? 'deck'}`, 'csv'), toCsv(rows), 'text/csv');
  }

  return (
    <div className="stack-lg">
      <PageHead
        kicker="Flashcards"
        title={deck.name}
        lead={deck.description !== '' ? deck.description : undefined}
      >
        <div className="row" style={{ marginTop: 14 }}>
          {due > 0 ? (
            <Link className="btn" to={`/flashcards/${deck.id}/review`}>
              Review {due} due {due === 1 ? 'card' : 'cards'}
            </Link>
          ) : own.length > 0 ? (
            <Link className="btn btn-secondary" to={`/flashcards/${deck.id}/review?all=1`}>
              Nothing due. Practise anyway
            </Link>
          ) : null}
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={exportJson}
            disabled={own.length === 0}
          >
            Save as deck file
          </button>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={exportCsv}
            disabled={own.length === 0}
          >
            Save as CSV
          </button>
          <button
            type="button"
            className="btn btn-danger btn-sm"
            onClick={() => setConfirmDelete(true)}
          >
            Delete deck
          </button>
        </div>
      </PageHead>

      <div className="grid-2">
        <section className="card stack">
          <h3>Add a card</h3>
          <form
            className="stack"
            onSubmit={async (e) => {
              e.preventDefault();
              if (front.trim() === '' || back.trim() === '') return;
              await addCard(front, back, hint);
              setFront('');
              setBack('');
              setHint('');
            }}
          >
            <div className="field">
              <label htmlFor="card-front">Front: the question or the cue</label>
              <textarea
                id="card-front"
                className="textarea"
                style={{ minHeight: 70 }}
                maxLength={2000}
                value={front}
                onChange={(e) => setFront(e.target.value)}
              />
            </div>
            <div className="field">
              <label htmlFor="card-back">Back: the answer</label>
              <textarea
                id="card-back"
                className="textarea"
                style={{ minHeight: 70 }}
                maxLength={2000}
                value={back}
                onChange={(e) => setBack(e.target.value)}
              />
            </div>
            <div className="field">
              <label htmlFor="card-hint">Hint (optional, shown only if you ask for it)</label>
              <input
                id="card-hint"
                className="input"
                maxLength={400}
                value={hint}
                onChange={(e) => setHint(e.target.value)}
              />
            </div>
            <button
              type="submit"
              className="btn"
              disabled={front.trim() === '' || back.trim() === ''}
            >
              Add card
            </button>
          </form>
        </section>

        <section className="card stack">
          <h3>Paste many at once</h3>
          <p className="small muted">
            One card per line. Put <code>::</code> between the front and the back, or a tab, or a
            comma.
          </p>
          <textarea
            className="textarea"
            aria-label="Cards to paste"
            placeholder={'ohm :: volts divided by amps\nnewton :: kg·m/s²'}
            value={paste}
            maxLength={200_000}
            onChange={(e) => setPaste(e.target.value)}
          />
          <div className="row">
            <button
              type="button"
              className="btn"
              disabled={paste.trim() === ''}
              onClick={async () => {
                const parsed = parsePastedCards(paste);
                if (parsed.length === 0) {
                  setPasteMessage('No lines could be read. Check there is a :: on each line.');
                  return;
                }
                const t = nowIso();
                await cards.putMany(
                  parsed.map((c) => ({
                    id: newId(),
                    deckId: deck.id,
                    front: c.front,
                    back: c.back,
                    hint: '',
                    mnemonicId: null,
                    tags: [],
                    createdAt: t,
                    updatedAt: t,
                    review: freshReview(),
                  })),
                );
                await decks.put(touch(deck));
                setPaste('');
                setPasteMessage(
                  `Added ${parsed.length} ${parsed.length === 1 ? 'card' : 'cards'}.`,
                );
              }}
            >
              Add these cards
            </button>
            {pasteMessage !== '' && <span className="small muted">{pasteMessage}</span>}
          </div>
        </section>
      </div>

      <section className="stack">
        <div className="toolbar">
          <h3>
            {own.length} {own.length === 1 ? 'card' : 'cards'}
          </h3>
          <input
            className="input"
            placeholder="Search this deck"
            aria-label="Search this deck"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        {shown.length === 0 ? (
          <p className="empty">{own.length === 0 ? 'No cards yet.' : 'No card matches that.'}</p>
        ) : (
          <ul className="list">
            {shown.map((c) => (
              <CardRow
                key={c.id}
                card={c}
                mnemonic={
                  c.mnemonicId ? mnemonicList.find((m) => m.id === c.mnemonicId) : undefined
                }
                mnemonics={mnemonicList}
                editing={editing === c.id}
                onEdit={() => setEditing(editing === c.id ? null : c.id)}
                onSave={async (patch) => {
                  await cards.put(touch({ ...c, ...patch }));
                  setEditing(null);
                }}
                onDelete={() => void cards.remove(c.id)}
                onReset={() => void cards.put(touch({ ...c, review: freshReview() }))}
              />
            ))}
          </ul>
        )}
      </section>

      <ConfirmDialog
        open={confirmDelete}
        title="Delete this deck?"
        body={
          <p>
            All {own.length} cards in it will be deleted too. Save it as a file first if you want to
            keep it.
          </p>
        }
        confirmLabel="Delete the deck"
        danger
        onConfirm={async () => {
          setConfirmDelete(false);
          await cards.removeMany(own.map((c) => c.id));
          await decks.remove(deck.id);
          void navigate('/flashcards');
        }}
        onCancel={() => setConfirmDelete(false)}
      />
    </div>
  );
}

interface RowProps {
  card: Card;
  mnemonic: Mnemonic | undefined;
  mnemonics: readonly Mnemonic[];
  editing: boolean;
  onEdit: () => void;
  onSave: (patch: Partial<Card>) => Promise<void>;
  onDelete: () => void;
  onReset: () => void;
}

const CardRow = memo(function CardRow({
  card,
  mnemonic,
  mnemonics,
  editing,
  onEdit,
  onSave,
  onDelete,
  onReset,
}: RowProps) {
  const [front, setFront] = useState(card.front);
  const [back, setBack] = useState(card.back);
  const [hint, setHint] = useState(card.hint);
  const [mnemonicId, setMnemonicId] = useState<string>(card.mnemonicId ?? '');
  const [tags, setTags] = useState(card.tags.join(' '));
  const due = new Date(card.review.due);
  return (
    <li className="list-item" style={{ flexDirection: 'column', alignItems: 'stretch' }}>
      {editing ? (
        <form
          className="stack"
          onSubmit={(e) => {
            e.preventDefault();
            void onSave({
              front: front.trim(),
              back: back.trim(),
              hint: hint.trim(),
              mnemonicId: mnemonicId === '' ? null : mnemonicId,
              tags: tags
                .split(/[\s,]+/)
                .map((t) => t.trim())
                .filter((t) => t !== '')
                .slice(0, 20),
            });
          }}
        >
          <div className="grid-2">
            <div className="field">
              <label htmlFor={`f-${card.id}`}>Front</label>
              <textarea
                id={`f-${card.id}`}
                className="textarea"
                style={{ minHeight: 60 }}
                maxLength={2000}
                value={front}
                onChange={(e) => setFront(e.target.value)}
              />
            </div>
            <div className="field">
              <label htmlFor={`b-${card.id}`}>Back</label>
              <textarea
                id={`b-${card.id}`}
                className="textarea"
                style={{ minHeight: 60 }}
                maxLength={2000}
                value={back}
                onChange={(e) => setBack(e.target.value)}
              />
            </div>
          </div>
          <div className="grid-3">
            <div className="field">
              <label htmlFor={`h-${card.id}`}>Hint</label>
              <input
                id={`h-${card.id}`}
                className="input"
                maxLength={400}
                value={hint}
                onChange={(e) => setHint(e.target.value)}
              />
            </div>
            <div className="field">
              <label htmlFor={`t-${card.id}`}>Tags, separated by spaces</label>
              <input
                id={`t-${card.id}`}
                className="input"
                maxLength={400}
                value={tags}
                onChange={(e) => setTags(e.target.value)}
              />
            </div>
            <div className="field">
              <label htmlFor={`m-${card.id}`}>Mnemonic to show after answering</label>
              <select
                id={`m-${card.id}`}
                className="select"
                value={mnemonicId}
                onChange={(e) => setMnemonicId(e.target.value)}
              >
                <option value="">None</option>
                {mnemonics.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.title}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="btn-group">
            <button
              type="submit"
              className="btn btn-sm"
              disabled={front.trim() === '' || back.trim() === ''}
            >
              Save
            </button>
            <button type="button" className="btn btn-sm btn-secondary" onClick={onEdit}>
              Cancel
            </button>
            <button type="button" className="btn btn-sm btn-secondary" onClick={onReset}>
              Reset its schedule
            </button>
            <button type="button" className="btn btn-sm btn-danger" onClick={onDelete}>
              Delete card
            </button>
          </div>
        </form>
      ) : (
        <div className="row row-between" style={{ alignItems: 'flex-start' }}>
          <div className="body">
            <div className="title">{card.front}</div>
            <div>{card.back}</div>
            <div className="meta">
              {card.review.reps === 0
                ? 'New'
                : `Due ${formatDate(due)} · gap ${Math.round(card.review.intervalDays)} d · ${card.review.reps} reviews`}
              {mnemonic && ` · mnemonic: ${mnemonic.title}`}
            </div>
            {card.tags.length > 0 && (
              <div className="tags">
                {card.tags.map((t) => (
                  <span className="tag" key={t}>
                    {t}
                  </span>
                ))}
              </div>
            )}
          </div>
          <button type="button" className="btn btn-sm btn-secondary" onClick={onEdit}>
            Edit
          </button>
        </div>
      )}
    </li>
  );
});
