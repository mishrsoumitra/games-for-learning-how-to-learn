import { useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router';
import { ConfirmDialog } from '../../components/Modal.tsx';
import { PageHead } from '../../components/PageHead.tsx';
import { cards, mnemonics, useCards, useMnemonics } from '../../data/repo.ts';
import { MnemonicSchema, type MnemonicKind } from '../../data/schemas.ts';
import { nowIso } from '../../lib/dates.ts';
import { newId } from '../../lib/ids.ts';
import { initials } from '../../lib/text.ts';
import { chunkDigits, KINDS, kindInfo, PEGS } from './kinds.ts';

export default function MnemonicEditorPage() {
  const { mnemonicId } = useParams();
  const navigate = useNavigate();
  const list = useMnemonics();
  const allCards = useCards();
  const existing = mnemonicId ? list.find((m) => m.id === mnemonicId) : undefined;
  const isNew = !mnemonicId;

  const [kind, setKind] = useState<MnemonicKind>(existing?.kind ?? 'acronym');
  const [title, setTitle] = useState(existing?.title ?? '');
  const [target, setTarget] = useState(existing?.target ?? '');
  const [text, setText] = useState(existing?.text ?? '');
  const [notes, setNotes] = useState(existing?.notes ?? '');
  const [tags, setTags] = useState(existing?.tags.join(' ') ?? '');
  const [error, setError] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(false);

  const info = kindInfo(kind);
  const linkedCards = useMemo(
    () => (existing ? allCards.filter((c) => c.mnemonicId === existing.id) : []),
    [allCards, existing],
  );

  if (!isNew && !existing) {
    return (
      <div className="narrow stack">
        <h1>That mnemonic was not found</h1>
        <Link className="btn" to="/mnemonics">
          Back to your mnemonics
        </Link>
      </div>
    );
  }

  async function save() {
    const t = nowIso();
    const record = {
      id: existing?.id ?? newId(),
      kind,
      title: title.trim(),
      target: target.trim(),
      text: text.trim(),
      notes: notes.trim(),
      tags: tags
        .split(/[\s,]+/)
        .map((x) => x.trim())
        .filter((x) => x !== '')
        .slice(0, 20),
      createdAt: existing?.createdAt ?? t,
      updatedAt: t,
      recallCount: existing?.recallCount ?? 0,
      recallCorrect: existing?.recallCorrect ?? 0,
      ...(existing?.lastRecalledAt ? { lastRecalledAt: existing.lastRecalledAt } : {}),
    };
    const parsed = MnemonicSchema.safeParse(record);
    if (!parsed.success) {
      setError('Give it a title, the thing to remember, and the mnemonic itself.');
      return;
    }
    await mnemonics.put(parsed.data);
    void navigate('/mnemonics');
  }

  return (
    <div className="narrow stack-lg">
      <PageHead kicker="Mnemonics" title={isNew ? 'Make a mnemonic' : 'Edit the mnemonic'} />

      <section className="card stack">
        <div className="field">
          <label htmlFor="kind">What kind of hook?</label>
          <select
            id="kind"
            className="select"
            value={kind}
            onChange={(e) => setKind(e.target.value as MnemonicKind)}
          >
            {KINDS.map((k) => (
              <option key={k.kind} value={k.kind}>
                {k.name}
              </option>
            ))}
          </select>
        </div>
        <p>{info.what}</p>
        <p className="small muted">Example: {info.example}</p>
      </section>

      <section className="card stack">
        <div className="field">
          <label htmlFor="title">A short title, so you can find it later</label>
          <input
            id="title"
            className="input"
            maxLength={120}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Order of the planets"
          />
        </div>
        <div className="field">
          <label htmlFor="target">{info.targetLabel}</label>
          <textarea
            id="target"
            className="textarea"
            maxLength={2000}
            value={target}
            onChange={(e) => setTarget(e.target.value)}
          />
        </div>
        <Helper kind={kind} target={target} />
        <div className="field">
          <label htmlFor="text">{info.textLabel}</label>
          <textarea
            id="text"
            className="textarea"
            maxLength={2000}
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          <span className="help">
            Make it yours. A picture that is a bit silly, or a sentence about people you know,
            sticks better than a neat one.
          </span>
        </div>
        <div className="field">
          <label htmlFor="notes">Notes (optional)</label>
          <textarea
            id="notes"
            className="textarea"
            style={{ minHeight: 70 }}
            maxLength={2000}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>
        <div className="field">
          <label htmlFor="tags">Tags, separated by spaces (optional)</label>
          <input
            id="tags"
            className="input"
            maxLength={400}
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="physics unit-2"
          />
        </div>
        {error !== '' && (
          <p className="error-text" role="alert">
            {error}
          </p>
        )}
        <div className="btn-group">
          <button type="button" className="btn" onClick={() => void save()}>
            {isNew ? 'Save the mnemonic' : 'Save changes'}
          </button>
          <Link className="btn btn-secondary" to="/mnemonics">
            Cancel
          </Link>
          {existing && (
            <button type="button" className="btn btn-danger" onClick={() => setConfirmDelete(true)}>
              Delete
            </button>
          )}
        </div>
      </section>

      {existing && (
        <section className="card stack">
          <h3>Linked flashcards</h3>
          {linkedCards.length === 0 ? (
            <p className="small muted">
              None yet. Open a card in a deck, press Edit, and pick this mnemonic. It will then be
              shown after you answer that card.
            </p>
          ) : (
            <ul>
              {linkedCards.map((c) => (
                <li key={c.id}>
                  <Link to={`/flashcards/${c.deckId}`}>{c.front}</Link>
                </li>
              ))}
            </ul>
          )}
          {existing.recallCount > 0 && (
            <p className="small muted">
              You have recalled this {existing.recallCorrect} of {existing.recallCount} times in the
              quiz.
            </p>
          )}
        </section>
      )}

      {existing && (
        <ConfirmDialog
          open={confirmDelete}
          title="Delete this mnemonic?"
          body={<p>Cards that use it will keep working; they just lose the hint.</p>}
          confirmLabel="Delete"
          danger
          onConfirm={async () => {
            setConfirmDelete(false);
            await cards.putMany(
              linkedCards.map((c) => ({ ...c, mnemonicId: null, updatedAt: nowIso() })),
            );
            await mnemonics.remove(existing.id);
            void navigate('/mnemonics');
          }}
          onCancel={() => setConfirmDelete(false)}
        />
      )}
    </div>
  );
}

/** Kind-specific help that works from what the student has typed so far. */
function Helper({ kind, target }: { kind: MnemonicKind; target: string }) {
  const lines = target
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l !== '');
  switch (kind) {
    case 'acronym':
    case 'acrostic': {
      if (lines.length < 2)
        return (
          <p className="small muted">
            Type the items one per line and the first letters will appear here.
          </p>
        );
      const letters = initials(lines);
      return (
        <div className="notice stack">
          <p>
            First letters, in order: <strong style={{ letterSpacing: '0.2em' }}>{letters}</strong>
          </p>
          <p className="small">
            {kind === 'acronym'
              ? 'Can you say that as a word? If not, try reordering the items where the order does not matter, or swap an item for a synonym that starts with a vowel.'
              : 'Now write a sentence whose words start with these letters, in this order. Put a person you know in it.'}
          </p>
        </div>
      );
    }
    case 'pegs': {
      if (lines.length === 0)
        return (
          <p className="small muted">Type the items one per line, and each gets its number peg.</p>
        );
      return (
        <div className="notice">
          <ol>
            {lines.slice(0, 10).map((l, i) => (
              // oxlint-disable-next-line react/no-array-index-key -- lines may repeat; order is the identity
              <li key={i}>
                {l} with a <strong>{PEGS[i]}</strong>
              </li>
            ))}
          </ol>
          {lines.length > 10 && (
            <p className="small">Only ten pegs; split a longer list into two mnemonics.</p>
          )}
        </div>
      );
    }
    case 'chunking': {
      const groups = chunkDigits(target);
      if (groups.length === 0)
        return (
          <p className="small muted">
            Type the number or string and it will be split into groups of three.
          </p>
        );
      return (
        <div className="notice stack">
          <p>
            In threes: <strong style={{ letterSpacing: '0.1em' }}>{groups.join(' · ')}</strong>
          </p>
          <p>
            In fours:{' '}
            <strong style={{ letterSpacing: '0.1em' }}>{chunkDigits(target, 4).join(' · ')}</strong>
          </p>
          <p className="small">
            Give each group a reading: a year, a price, a bus number, anything you already know.
          </p>
        </div>
      );
    }
    case 'keyword':
      return (
        <p className="small muted">
          Say the word out loud. What ordinary word does it sound like? Then picture that word and
          the meaning in one scene, with movement in it.
        </p>
      );
    case 'story':
      return (
        <p className="small muted">
          Pick a place you walk through every day. Put the first item at the entrance, the next at
          the next thing you pass, and so on. Make each item do something at its spot.
        </p>
      );
    default:
      return null;
  }
}
