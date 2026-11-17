import { useState } from 'react';
import { Link } from 'react-router';
import { PageHead } from '../../components/PageHead.tsx';
import { mnemonics, useMnemonics } from '../../data/repo.ts';
import type { Mnemonic } from '../../data/schemas.ts';
import { nowIso } from '../../lib/dates.ts';
import { randomSeed } from '../../lib/ids.ts';
import { Rng } from '../../lib/rng.ts';
import { kindInfo } from './kinds.ts';

/**
 * Retrieval practice on the mnemonics themselves. The cue is the thing to remember; the
 * student writes the mnemonic (or the fact) from memory, then compares and marks it.
 * The two directions alternate so both the hook and the fact get pulled on.
 */
export default function MnemonicQuizPage() {
  const list = useMnemonics();
  const [round, setRound] = useState(0);
  if (list.length === 0) {
    return (
      <div className="narrow stack">
        <PageHead kicker="Mnemonics" title="Nothing to test yet" lead="Make a mnemonic first." />
        <Link className="btn" to="/mnemonics/new">
          Make a mnemonic
        </Link>
      </div>
    );
  }
  return <Quiz key={round} list={list} onAgain={() => setRound((r) => r + 1)} />;
}

function buildOrder(list: readonly Mnemonic[]): string[] {
  const sorted = [...list].sort((a, b) =>
    (a.lastRecalledAt ?? '').localeCompare(b.lastRecalledAt ?? ''),
  );
  return new Rng(randomSeed()).shuffle(sorted.slice(0, 20).map((m) => m.id));
}

function Quiz({ list, onAgain }: { list: readonly Mnemonic[]; onAgain: () => void }) {
  const [order] = useState(() => buildOrder(list));
  const [index, setIndex] = useState(0);
  const [typed, setTyped] = useState('');
  const [revealed, setRevealed] = useState(false);
  const [right, setRight] = useState(0);

  const id = order[index];
  const current = id ? list.find((m) => m.id === id) : undefined;
  const direction = index % 2 === 0 ? 'fact-to-hook' : 'hook-to-fact';

  if (!current) {
    return (
      <div className="narrow stack">
        <PageHead
          kicker="Mnemonics"
          title="Quiz done"
          lead={`${right} of ${order.length} came back. The ones that did not are the ones to rebuild: a hook that does not pull is the wrong hook, not a bad memory.`}
        />
        <div className="btn-group">
          <Link className="btn" to="/mnemonics">
            Back to the list
          </Link>
          <button type="button" className="btn btn-secondary" onClick={onAgain}>
            Again
          </button>
        </div>
      </div>
    );
  }

  async function mark(correct: boolean) {
    if (!current) return;
    await mnemonics.put({
      ...current,
      recallCount: current.recallCount + 1,
      recallCorrect: current.recallCorrect + (correct ? 1 : 0),
      lastRecalledAt: nowIso(),
      updatedAt: nowIso(),
    });
    if (correct) setRight((n) => n + 1);
    setIndex((i) => i + 1);
    setTyped('');
    setRevealed(false);
  }

  const cue = direction === 'fact-to-hook' ? current.target : current.text;
  const answer = direction === 'fact-to-hook' ? current.text : current.target;

  return (
    <div className="narrow stack">
      <div className="row row-between">
        <p className="kicker" style={{ margin: 0 }}>
          Mnemonic quiz · {kindInfo(current.kind).name}
        </p>
        <span className="small muted">
          {index + 1} of {order.length}
        </span>
      </div>
      <div className="flashcard" style={{ alignItems: 'stretch', textAlign: 'left' }}>
        <p className="small muted">
          {direction === 'fact-to-hook'
            ? 'The thing to remember. Write your mnemonic for it.'
            : 'Your mnemonic. Write what it stands for.'}
        </p>
        <div className="front" style={{ whiteSpace: 'pre-wrap', fontSize: 22 }}>
          {cue}
        </div>
        {!revealed ? (
          <form
            className="stack"
            onSubmit={(e) => {
              e.preventDefault();
              setRevealed(true);
            }}
          >
            <label className="visually-hidden" htmlFor="quiz-answer">
              Your answer
            </label>
            <textarea
              id="quiz-answer"
              className="textarea"
              value={typed}
              maxLength={2000}
              onChange={(e) => setTyped(e.target.value)}
              placeholder="From memory"
            />
            <button type="submit" className="btn">
              Show what I saved
            </button>
          </form>
        ) : (
          <div className="stack">
            <div className="back" style={{ whiteSpace: 'pre-wrap', textAlign: 'left' }}>
              {answer}
            </div>
            {typed.trim() !== '' && (
              <p className="small muted" style={{ whiteSpace: 'pre-wrap' }}>
                You wrote: {typed}
              </p>
            )}
            <p className="small">Did it come back? You decide.</p>
            <div className="btn-group">
              <button type="button" className="btn" onClick={() => void mark(true)}>
                Yes, it came back
              </button>
              <button type="button" className="btn btn-danger" onClick={() => void mark(false)}>
                No
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
