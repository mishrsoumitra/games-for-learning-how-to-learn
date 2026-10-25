import type { ReactNode } from 'react';
import { Link, useParams } from 'react-router';
import { useRun } from '../activities/common.ts';
import type { ActivityId, Run } from '../data/schemas.ts';
import { Loading } from './Loading.tsx';

interface Props<S> {
  activity: ActivityId;
  parse: (run: Run) => S | null;
  children: (run: Run, state: S) => ReactNode;
}

/** Loads the run named in the address, checks it belongs to this activity and parses its state. */
export function RunGuard<S>({ activity, parse, children }: Props<S>) {
  const { runId } = useParams();
  const run = useRun(runId);
  if (!runId) return <Loading />;
  if (!run || run.activity !== activity) {
    return (
      <div className="narrow stack">
        <h1>That run was not found</h1>
        <p>It may have been deleted, or the address is wrong.</p>
        <Link className="btn" to="/">
          Go to the home page
        </Link>
      </div>
    );
  }
  const state = parse(run);
  if (!state) {
    return (
      <div className="narrow stack">
        <h1>This run cannot be read</h1>
        <p>
          Its saved data does not match what this version of the app expects. You can start the
          activity again from its page.
        </p>
        <Link className="btn" to="/">
          Go to the home page
        </Link>
      </div>
    );
  }
  return <>{children(run, state)}</>;
}
