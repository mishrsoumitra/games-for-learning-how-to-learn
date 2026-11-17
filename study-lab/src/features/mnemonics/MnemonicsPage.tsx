import { useDeferredValue, useMemo, useState } from 'react';
import { Link } from 'react-router';
import { PageHead } from '../../components/PageHead.tsx';
import { useMnemonics } from '../../data/repo.ts';
import { formatDate } from '../../lib/dates.ts';
import { truncate } from '../../lib/text.ts';
import { KINDS, kindInfo } from './kinds.ts';

export default function MnemonicsPage() {
  const list = useMnemonics();
  const [search, setSearch] = useState('');
  const [kind, setKind] = useState('');
  const q = useDeferredValue(search);
  const shown = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return [...list]
      .filter((m) => kind === '' || m.kind === kind)
      .filter(
        (m) =>
          needle === '' ||
          m.title.toLowerCase().includes(needle) ||
          m.target.toLowerCase().includes(needle) ||
          m.text.toLowerCase().includes(needle) ||
          m.tags.some((t) => t.toLowerCase().includes(needle)),
      )
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  }, [list, q, kind]);

  return (
    <div className="stack-lg">
      <PageHead
        kicker="Mnemonics"
        title="Your mnemonics"
        lead="A mnemonic is a hook: a word, a sentence, a picture or a story that pulls a hard fact back out of memory. Make one, keep it here, and test yourself on it, because a hook you never pull on rusts too."
      >
        <div className="row" style={{ marginTop: 14 }}>
          <Link className="btn" to="/mnemonics/new">
            Make a mnemonic
          </Link>
          {list.length > 0 && (
            <Link className="btn btn-secondary" to="/mnemonics/quiz">
              Test me on them
            </Link>
          )}
        </div>
      </PageHead>

      {list.length > 0 && (
        <div className="toolbar">
          <input
            className="input"
            placeholder="Search"
            aria-label="Search mnemonics"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select
            className="select"
            style={{ maxWidth: 240 }}
            aria-label="Kind"
            value={kind}
            onChange={(e) => setKind(e.target.value)}
          >
            <option value="">Every kind</option>
            {KINDS.map((k) => (
              <option key={k.kind} value={k.kind}>
                {k.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {list.length === 0 ? (
        <div className="card stack">
          <h3>Where to start</h3>
          <p>
            Think of one thing from this week that would not stay in your head: a list, an order of
            steps, a constant, a foreign word. Press "Make a mnemonic" and the page walks you
            through six ways to hook it.
          </p>
        </div>
      ) : shown.length === 0 ? (
        <p className="empty">Nothing matches that.</p>
      ) : (
        <ul className="list">
          {shown.map((m) => (
            <li className="list-item" key={m.id}>
              <div className="body">
                <div className="title">
                  <Link to={`/mnemonics/${m.id}`}>{m.title}</Link>
                </div>
                <div>{truncate(m.text, 140)}</div>
                <div className="meta">
                  {kindInfo(m.kind).name} · for: {truncate(m.target, 60)} ·{' '}
                  {formatDate(new Date(m.updatedAt))}
                  {m.recallCount > 0 && ` · recalled ${m.recallCorrect} of ${m.recallCount} times`}
                </div>
                {m.tags.length > 0 && (
                  <div className="tags">
                    {m.tags.map((t) => (
                      <span className="tag" key={t}>
                        {t}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <Link className="btn btn-sm btn-secondary" to={`/mnemonics/${m.id}`}>
                Open
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
