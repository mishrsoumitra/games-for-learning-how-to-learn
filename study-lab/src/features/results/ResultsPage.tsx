import { useMemo } from 'react';
import { Link } from 'react-router';
import { completedRuns } from '../../activities/common.ts';
import { ACTIVITIES, activityMeta } from '../../activities/registry.ts';
import { QuadrantPlot } from '../../components/charts/QuadrantPlot.tsx';
import { PageHead } from '../../components/PageHead.tsx';
import { buildBundle } from '../../data/exportImport.ts';
import { runs, useRuns } from '../../data/repo.ts';
import { formatDateTime } from '../../lib/dates.ts';
import { downloadText, fileName, toCsv } from '../../lib/download.ts';

export default function ResultsPage() {
  const all = useRuns();
  const done = useMemo(() => completedRuns(all), [all]);
  const unfinished = useMemo(
    () =>
      all
        .filter((r) => r.status !== 'complete')
        .sort((a, b) => b.startedAt.localeCompare(a.startedAt)),
    [all],
  );

  const points = done
    .filter((r) => r.result && r.result.predictedGapPct !== null)
    .map((r) => ({
      id: r.id,
      felt: r.result?.predictedGapPct ?? 0,
      worked: r.result?.gapPct ?? 0,
      label: `${activityMeta(r.activity).title}, ${r.completedAt ? formatDateTime(r.completedAt) : ''}`,
    }));

  function exportCsv() {
    const rows: (string | number | null)[][] = [
      [
        'activity',
        'completed_at',
        'off_schedule',
        'honesty',
        'condition_1',
        'predicted_1_pct',
        'scored_1_pct',
        'condition_2',
        'predicted_2_pct',
        'scored_2_pct',
        'gap_pct',
        'predicted_gap_pct',
      ],
    ];
    for (const r of done) {
      const [a, b] = r.result?.conditions ?? [];
      rows.push([
        r.activity,
        r.completedAt ?? '',
        r.offSchedule ? 'yes' : 'no',
        r.result?.honesty ?? '',
        a?.label ?? '',
        a?.predictedPct ?? null,
        a?.scoredPct ?? null,
        b?.label ?? '',
        b?.predictedPct ?? null,
        b?.scoredPct ?? null,
        r.result?.gapPct ?? null,
        r.result?.predictedGapPct ?? null,
      ]);
    }
    downloadText(fileName('study-lab-results', 'csv'), toCsv(rows), 'text/csv');
  }

  return (
    <div className="stack-lg">
      <PageHead
        kicker="Results"
        title="Felt versus worked"
        lead="Every run puts one dot on this plot. Left to right is how much better you expected the research-favoured way to do. Bottom to top is how much better it actually did. Most students, in most studies, land top-left: it felt worse and worked better."
      />

      <section className="card">
        <QuadrantPlot
          title="Your runs"
          points={points}
          xLabel="How much better you expected it to do (points)"
          yLabel="How much better it did (points)"
        />
      </section>

      <section className="stack">
        <div className="row row-between">
          <h2>Your finished runs</h2>
          <div className="btn-group">
            <button
              type="button"
              className="btn btn-sm btn-secondary"
              onClick={exportCsv}
              disabled={done.length === 0}
            >
              Save all as CSV
            </button>
            <button
              type="button"
              className="btn btn-sm btn-secondary"
              onClick={() =>
                downloadText(
                  fileName('study-lab-backup', 'json'),
                  JSON.stringify(buildBundle(), null, 2),
                )
              }
            >
              Save a full backup
            </button>
            <Link className="btn btn-sm btn-secondary" to="/results/class">
              Teacher: the class plot
            </Link>
          </div>
        </div>
        {done.length === 0 ? (
          <p className="empty">
            No finished runs yet. {ACTIVITIES[0]?.title ?? 'Mixed or blocked'} takes fifteen minutes
            and finishes in one sitting.
          </p>
        ) : (
          <ul className="list">
            {done.map((r) => {
              const meta = activityMeta(r.activity);
              const [a, b] = r.result?.conditions ?? [];
              return (
                <li className="list-item" key={r.id}>
                  <div className="body">
                    <div className="title">{meta.title}</div>
                    <div className="meta">
                      {r.completedAt ? formatDateTime(r.completedAt) : ''}
                      {a && b && ` · ${a.label} ${a.scoredPct}%, ${b.label} ${b.scoredPct}%`}
                      {r.offSchedule && ' · off schedule'}
                      {r.result?.honesty !== 'clean' && ' · looked in between'}
                    </div>
                  </div>
                  <Link className="btn btn-sm btn-secondary" to={`/results/${r.id}`}>
                    Open
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {unfinished.length > 0 && (
        <section className="stack">
          <h2>Unfinished runs</h2>
          <ul className="list">
            {unfinished.map((r) => {
              const meta = activityMeta(r.activity);
              return (
                <li className="list-item" key={r.id}>
                  <div className="body">
                    <div className="title">{meta.title}</div>
                    <div className="meta">
                      Started {formatDateTime(r.startedAt)} ·{' '}
                      {r.status === 'abandoned' ? 'given up' : 'going'}
                    </div>
                  </div>
                  <div className="btn-group">
                    {r.status === 'in-progress' && (
                      <Link className="btn btn-sm" to={`${meta.path}/run/${r.id}`}>
                        Continue
                      </Link>
                    )}
                    <button
                      type="button"
                      className="btn btn-sm btn-danger"
                      onClick={() => void runs.remove(r.id)}
                    >
                      Delete
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        </section>
      )}
    </div>
  );
}
