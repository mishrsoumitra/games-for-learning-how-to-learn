import { useMemo, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router';
import { TypedAnswer } from '../../components/TypedAnswer.tsx';
import { cards, useCards, useDecks, useMnemonics } from '../../data/repo.ts';
import type { Card, Deck } from '../../data/schemas.ts';
import { Rng } from '../../lib/rng.ts';
import { randomSeed } from '../../lib/ids.ts';
import { answerMatches } from '../../lib/text.ts';
import { dueCards, nextReview, previewInterval, touch, type Grade } from './scheduler.ts';

const GRADES: { grade: Grade; label: string; className: string }[] = [
  { grade: 'again', label: 'Again', className: 'btn btn-danger' },
  { grade: 'hard', label: 'Hard', className: 'btn btn-secondary' },
  { grade: 'good', label: 'Good', className: 'btn' },
  { grade: 'easy', label: 'Easy', className: 'btn btn-secondary' },
];

/**
 * One review session. Each card: see the front, type what you remember, then see the back
 * and grade yourself. The typed answer is checked leniently and shown against the back, but
 * the student decides the grade. "Again" cards come back later in the same session.
 */
export default function ReviewPage() {
  const { deckId } = useParams();
  const [params] = useSearchParams();
  const all = params.get('all') === '1';
  const deckList = useDecks();
  const deck = deckList.find((d) => d.id === deckId);
  if (!deck) {
    return (
      <div className="narrow stack">
        <h1>That deck was not found</h1>
        <Link className="btn" to="/flashcards">
          Back to your decks
        </Link>
      </div>
    );
  }
  return <Session key={`${deck.id}-${all ? 'all' : 'due'}`} deck={deck} all={all} />;
}

function Session({ deck, all }: { deck: Deck; all: boolean }) {
  const allCards = useCards();
  const mnemonics = useMnemonics();
  const [queue, setQueue] = useState<string[]>(() => {
    const own = allCards.filter((c) => c.deckId === deck.id);
    const pool = all ? own : dueCards(own, new Date(), deck.id);
    return new Rng(randomSeed()).shuffle(pool.map((c) => c.id)).slice(0, 200);
  });
  const [showBack, setShowBack] = useState(false);
  const [typed, setTyped] = useState('');
  const [doneCount, setDoneCount] = useState(0);
  const [againCount, setAgainCount] = useState(0);

  const current: Card | undefined = useMemo(() => {
    const id = queue[0];
    return id ? allCards.find((c) => c.id === id) : undefined;
  }, [queue, allCards]);
  const mnemonic = current?.mnemonicId
    ? mnemonics.find((m) => m.id === current.mnemonicId)
    : undefined;

  if (!current) {
    return (
      <div className="narrow stack-lg">
        <div className="page-head">
          <p className="kicker">{deck.name}</p>
          <h1>{doneCount === 0 ? 'Nothing to review' : 'Session done'}</h1>
          <p className="lead">
            {doneCount === 0
              ? 'No cards are due. Come back when the home page says some are, or practise the whole deck anyway.'
              : `${doneCount} ${doneCount === 1 ? 'card' : 'cards'} reviewed. ${againCount > 0 ? `${againCount} came back for a second go.` : ''} Each one will return just before you would forget it.`}
          </p>
        </div>
        <div className="btn-group">
          <Link className="btn" to={`/flashcards/${deck.id}`}>
            Back to the deck
          </Link>
          {doneCount === 0 && !all && (
            <Link className="btn btn-secondary" to={`/flashcards/${deck.id}/review?all=1`}>
              Practise the whole deck
            </Link>
          )}
        </div>
      </div>
    );
  }

  const matched = answerMatches(typed, [current.back]);

  async function grade(g: Grade) {
    if (!current) return;
    const review = nextReview(current.review, g);
    await cards.put(touch({ ...current, review }));
    setDoneCount((n) => n + 1);
    setShowBack(false);
    setTyped('');
    if (g === 'again') setAgainCount((n) => n + 1);
    setQueue((q) => {
      const rest = q.slice(1);
      if (g === 'again') {
        const at = Math.min(rest.length, 3);
        return [...rest.slice(0, at), current.id, ...rest.slice(at)];
      }
      return rest;
    });
  }

  return (
    <div className="narrow stack">
      <div className="row row-between">
        <p className="kicker" style={{ margin: 0 }}>
          {deck.name}
        </p>
        <span className="small muted">{queue.length} left</span>
      </div>
      <div className="flashcard">
        <div className="front">{current.front}</div>
        {showBack ? (
          <>
            <hr style={{ width: '60%' }} />
            <div className="back">{current.back}</div>
            {typed.trim() !== '' && (
              <p className={matched ? 'feedback-right' : 'feedback-wrong'}>
                {matched ? 'That matches.' : `You typed: ${typed}`}
              </p>
            )}
            {mnemonic && (
              <p className="small muted">
                Your mnemonic: <em>{mnemonic.text}</em>
              </p>
            )}
          </>
        ) : (
          <>
            {current.hint !== '' && (
              <details>
                <summary className="small muted">Show the hint</summary>
                <p className="small">{current.hint}</p>
              </details>
            )}
            <TypedAnswer
              prompt="Type your answer from memory, then check"
              buttonLabel="Show the answer"
              itemKey={`${current.id}-${doneCount}`}
              onSubmit={(t) => {
                setTyped(t);
                setShowBack(true);
              }}
            />
          </>
        )}
      </div>
      {showBack && (
        <div className="stack">
          <p className="small muted">How did it go? The buttons show when the card comes back.</p>
          <div className="grade-row">
            {GRADES.map((g) => (
              <button
                key={g.grade}
                type="button"
                className={g.className}
                onClick={() => void grade(g.grade)}
              >
                {g.label}
                <small>{previewInterval(current.review, g.grade)}</small>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
