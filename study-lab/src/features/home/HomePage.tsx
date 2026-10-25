import { useMemo } from 'react';
import { Link } from 'react-router';
import { activeRun, completedRuns } from '../../activities/common.ts';
import { ACTIVITIES, activityMeta, describeNext } from '../../activities/registry.ts';
import { useClock } from '../../components/useTicker.ts';
import { useCards, useRuns, useSettings } from '../../data/repo.ts';
import { dueCards } from '../flashcards/scheduler.ts';

export default function HomePage() {
  const runs = useRuns();
  const cards = useCards();
  const settings = useSettings();
  const now = useClock(60_000);
  const nowDate = useMemo(() => new Date(now), [now]);

  const open = runs
    .filter((r) => r.status === 'in-progress')
    .map((r) => ({
      run: r,
      meta: activityMeta(r.activity),
      next: describeNext(r, settings.teacher, nowDate),
    }));
  const due = dueCards(cards, nowDate).length;
  const hasToday = open.length > 0 || due > 0;

  return (
    <div className="stack-lg">
      <div className="page-head">
        <p className="kicker">Learning How to Learn · Newton School of Technology</p>
        <h1>Study Lab</h1>
        <p className="lead">
          You already know which way of studying feels better. Rereading the chapter feels smooth,
          and testing yourself feels like a struggle. Here you find out, on your own memory, which
          way actually works. Then use the flashcards and mnemonics for your real subjects.
        </p>
      </div>

      <section className="card card-accent stack">
        <h3>Today</h3>
        {!hasToday && (
          <p className="muted">
            Nothing is waiting. Pick an activity below, or make a deck of flashcards for a subject
            you are studying this week.
          </p>
        )}
        {open.length > 0 && (
          <ul className="list">
            {open.map(({ run, meta, next }) => (
              <li className="list-item" key={run.id}>
                <div className="body">
                  <div className="title">{meta.title}</div>
                  <div className="meta">{next.label}</div>
                </div>
                <Link
                  className={next.ready ? 'btn btn-sm' : 'btn btn-sm btn-secondary'}
                  to={`${meta.path}/run/${run.id}`}
                >
                  {next.ready ? 'Continue' : 'Open'}
                </Link>
              </li>
            ))}
          </ul>
        )}
        {due > 0 && (
          <div className="list-item">
            <div className="body">
              <div className="title">Flashcards</div>
              <div className="meta">
                {due} {due === 1 ? 'card is' : 'cards are'} due for review.
              </div>
            </div>
            <Link className="btn btn-sm" to="/flashcards">
              Review
            </Link>
          </div>
        )}
      </section>

      <section className="stack">
        <h2>The activities</h2>
        <p className="lead">
          Each one studies the same material two ways and tests both. Before the test you say how
          well you think you did. Then you see your prediction next to your score.
        </p>
        <ol className="list">
          {ACTIVITIES.map((a) => {
            const current = activeRun(runs, a.id);
            const done = completedRuns(runs, a.id).length;
            return (
              <li key={a.id}>
                <Link className="card card-accent card-link" to={a.path}>
                  <div className="row row-between">
                    <h3>{a.title}</h3>
                    {current ? (
                      <span className="pill pill-warn">Going</span>
                    ) : done > 0 ? (
                      <span className="pill pill-good">
                        Done {done > 1 ? `${done} times` : 'once'}
                      </span>
                    ) : (
                      <span className="pill">Not started</span>
                    )}
                  </div>
                  <p className="card-when">
                    {a.lecture} · {a.time}
                  </p>
                  <p>{a.blurb}</p>
                </Link>
              </li>
            );
          })}
        </ol>
      </section>

      <section className="grid-3">
        <Link className="card card-link" to="/flashcards">
          <h3>Flashcards</h3>
          <p className="card-when">Your own subjects</p>
          <p>
            Make decks, type your answers, and let the app bring each card back just before you
            would forget it.
          </p>
        </Link>
        <Link className="card card-link" to="/mnemonics">
          <h3>Mnemonics</h3>
          <p className="card-when">Hooks for hard-to-hold facts</p>
          <p>Build an acronym, a story or a keyword image, keep it, and test yourself on it.</p>
        </Link>
        <Link className="card card-link" to="/results">
          <h3>Results</h3>
          <p className="card-when">Felt versus worked</p>
          <p>Every run you have finished, on one plot, next to the published numbers.</p>
        </Link>
      </section>
    </div>
  );
}
