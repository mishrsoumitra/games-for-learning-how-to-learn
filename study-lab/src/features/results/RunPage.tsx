import { lazy, Suspense, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router';
import { deleteRun, useRun } from '../../activities/common.ts';
import { activityMeta } from '../../activities/registry.ts';
import { Loading } from '../../components/Loading.tsx';
import { ConfirmDialog } from '../../components/Modal.tsx';
import { formatDateTime } from '../../lib/dates.ts';

const InterleavingRun = lazy(() => import('../../activities/interleaving/InterleavingRun.tsx'));
const RetrievalRun = lazy(() => import('../../activities/retrieval/RetrievalRun.tsx'));
const SpacingRun = lazy(() => import('../../activities/spacing/SpacingRun.tsx'));
const ProblemsRun = lazy(() => import('../../activities/problems/ProblemsRun.tsx'));

/** A finished run's result sheet, drawn by the activity's own screen, with a delete button. */
export default function RunPage() {
  const { runId } = useParams();
  const run = useRun(runId);
  const navigate = useNavigate();
  const [confirm, setConfirm] = useState(false);
  if (!run) {
    return (
      <div className="narrow stack">
        <h1>That run was not found</h1>
        <Link className="btn" to="/results">
          Back to results
        </Link>
      </div>
    );
  }
  const meta = activityMeta(run.activity);
  const Screen =
    run.activity === 'interleaving'
      ? InterleavingRun
      : run.activity === 'retrieval'
        ? RetrievalRun
        : run.activity === 'spacing'
          ? SpacingRun
          : ProblemsRun;
  return (
    <div className="stack-lg">
      <div className="row row-between">
        <p className="small muted">
          {meta.title} · started {formatDateTime(run.startedAt)}
        </p>
        <button type="button" className="btn btn-sm btn-danger" onClick={() => setConfirm(true)}>
          Delete this run
        </button>
      </div>
      <Suspense fallback={<Loading />}>
        <Screen />
      </Suspense>
      <ConfirmDialog
        open={confirm}
        title="Delete this run?"
        body={
          <p>
            Its result will be gone from this device. If you saved a result file, that file is
            unaffected.
          </p>
        }
        confirmLabel="Delete"
        danger
        onConfirm={async () => {
          setConfirm(false);
          await deleteRun(run);
          void navigate('/results');
        }}
        onCancel={() => setConfirm(false)}
      />
    </div>
  );
}
