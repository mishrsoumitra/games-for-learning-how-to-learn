import type { ReactNode } from 'react';
import { Link } from 'react-router';
import { abandonRun, activeRun, completedRuns } from '../activities/common.ts';
import { activityMeta, describeNext } from '../activities/registry.ts';
import type { ActivityId, Run } from '../data/schemas.ts';
import { useRuns, useSettings } from '../data/repo.ts';
import { formatDateTime } from '../lib/dates.ts';
import { PageHead } from './PageHead.tsx';

interface Props {
  activity: ActivityId;
  /** What the student will do, step by step, before they press start. */
  steps: readonly string[];
  /** Options shown above the start button (checkboxes etc.). */
  options?: ReactNode;
  onStart: () => Promise<Run>;
  children?: ReactNode;
}

/**
 * The page a student sees before an activity: what will happen, how long it takes, the one
 * rule (do not look things up), then a start button. If a run is already going, it offers
 * to continue instead, because starting again would spoil the schedule.
 */
export function ActivityIntro({ activity, steps, options, onStart, children }: Props) {
  const meta = activityMeta(activity);
  const runs = useRuns();
  const settings = useSettings();
  const current = activeRun(runs, activity);
  const done = completedRuns(runs, activity);
  const next = current ? describeNext(current, settings.teacher) : null;
  return (
    <div className="narrow stack-lg">
      <PageHead kicker={meta.lecture} title={meta.title} lead={meta.blurb}>
        <p className="small muted" style={{ marginTop: 10 }}>
          {meta.time}
        </p>
      </PageHead>

      {current && next && (
        <section className="card card-accent stack">
          <h3>You have a run going</h3>
          <p>
            Started {formatDateTime(current.startedAt)}. Next: {next.label}.
          </p>
          <div className="btn-group">
            <Link className="btn" to={`${meta.path}/run/${current.id}`}>
              {next.ready ? 'Continue' : 'Open it'}
            </Link>
            <button
              type="button"
              className="btn btn-danger btn-sm"
              onClick={() => {
                void abandonRun(current);
              }}
            >
              Give this run up and start again
            </button>
          </div>
          <p className="small muted">
            Giving up keeps the record but marks it as unfinished. Starting a fresh run while an old
            one is going would mix up the days, so the app does not allow it.
          </p>
        </section>
      )}

      <section className="card stack">
        <h3>What you will do</h3>
        <ol>
          {steps.map((s) => (
            <li key={s}>{s}</li>
          ))}
        </ol>
      </section>

      <section className="card stack">
        <h3>The one rule</h3>
        <p>
          Do not look anything up and do not practise outside the app. You cannot cheat this
          activity, you can only spoil your own numbers. Nothing here is graded. Do it alone, in a
          quiet place, and bring your result to class.
        </p>
      </section>

      {children}

      {!current && (
        <section className="card stack">
          {options}
          <button
            type="button"
            className="btn btn-lg"
            onClick={() => {
              void onStart();
            }}
          >
            Start now
          </button>
        </section>
      )}

      {done.length > 0 && (
        <section className="stack">
          <h3>Your earlier runs</h3>
          <ul className="list">
            {done.map((r) => (
              <li className="list-item" key={r.id}>
                <div className="body">
                  <div className="title">
                    Finished {r.completedAt ? formatDateTime(r.completedAt) : ''}
                  </div>
                  <div className="meta">
                    {r.result?.conditions.map((c) => `${c.label} ${c.scoredPct}%`).join(' · ')}
                  </div>
                </div>
                <Link className="btn btn-sm btn-secondary" to={`/results/${r.id}`}>
                  See result
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
