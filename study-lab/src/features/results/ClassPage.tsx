import { useMemo, useState } from 'react';
import { ACTIVITIES, activityMeta } from '../../activities/registry.ts';
import { PairedBars } from '../../components/charts/PairedBars.tsx';
import { QuadrantPlot } from '../../components/charts/QuadrantPlot.tsx';
import { FilePicker } from '../../components/FilePicker.tsx';
import { PageHead } from '../../components/PageHead.tsx';
import { PUBLISHED } from '../../content/research.ts';
import { parseResultFile } from '../../data/exportImport.ts';
import type { ActivityId, ResultFile } from '../../data/schemas.ts';
import { downloadText, fileName, toCsv } from '../../lib/download.ts';
import { mean, median, shareAbove } from '../../lib/stats.ts';

/**
 * The teacher's class plot. Students save a result file each; the teacher loads them all here
 * (many files at once). Nothing is uploaded anywhere: the plot is built in the browser from
 * the files chosen. Runs where the student said they looked in between are left out, and
 * off-schedule runs are counted separately.
 */
export default function ClassPage() {
  const [files, setFiles] = useState<ResultFile[]>([]);
  const [activity, setActivity] = useState<ActivityId>('interleaving');
  const [errors, setErrors] = useState<string[]>([]);
  const [includeOffSchedule, setIncludeOffSchedule] = useState(false);

  const selected = useMemo(() => {
    const seen = new Set<string>();
    return files
      .filter(
        (f) =>
          f.activity === activity &&
          f.result.honesty === 'clean' &&
          (includeOffSchedule || !f.offSchedule),
      )
      .filter((f) => {
        const key = `${f.participantCode}-${f.completedAt}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });
  }, [files, activity, includeOffSchedule]);

  const meta = activityMeta(activity);
  const gaps = selected.map((f) => f.result.gapPct);
  const predictedGaps = selected
    .map((f) => f.result.predictedGapPct)
    .filter((g): g is number => g !== null);
  const first = selected.map((f) => f.result.conditions[0]?.scoredPct ?? 0);
  const second = selected.map((f) => f.result.conditions[1]?.scoredPct ?? 0);
  const firstPred = selected
    .map((f) => f.result.conditions[0]?.predictedPct)
    .filter((v): v is number => v !== null && v !== undefined);
  const secondPred = selected
    .map((f) => f.result.conditions[1]?.predictedPct)
    .filter((v): v is number => v !== null && v !== undefined);
  const points = selected
    .filter((f) => f.result.predictedGapPct !== null)
    .map((f) => ({
      id: `${f.participantCode}-${f.completedAt}`,
      felt: f.result.predictedGapPct ?? 0,
      worked: f.result.gapPct,
      label: f.participantCode,
    }));

  const published = publishedFor(activity);

  function exportCsv() {
    const rows: (string | number | null)[][] = [
      [
        'code',
        'activity',
        'completed_at',
        'off_schedule',
        'honesty',
        'condition_1',
        'predicted_1',
        'scored_1',
        'condition_2',
        'predicted_2',
        'scored_2',
        'gap',
        'predicted_gap',
      ],
    ];
    for (const f of files) {
      const [a, b] = f.result.conditions;
      rows.push([
        f.participantCode,
        f.activity,
        f.completedAt,
        f.offSchedule ? 'yes' : 'no',
        f.result.honesty,
        a?.label ?? '',
        a?.predictedPct ?? null,
        a?.scoredPct ?? null,
        b?.label ?? '',
        b?.predictedPct ?? null,
        b?.scoredPct ?? null,
        f.result.gapPct,
        f.result.predictedGapPct,
      ]);
    }
    downloadText(fileName('class-results', 'csv'), toCsv(rows), 'text/csv');
  }

  return (
    <div className="stack-lg">
      <PageHead
        kicker="Results · for the teacher"
        title="The class plot"
        lead="Ask each student to save their result file from the result page and send it to you. Load all the files here at once. The plot is built on this computer; nothing is uploaded."
      />

      <section className="card stack">
        <div className="row">
          <FilePicker
            label="Load result files"
            multiple
            onText={(texts) => {
              const next: ResultFile[] = [];
              const errs: string[] = [];
              texts.forEach((t, i) => {
                const parsed = parseResultFile(t);
                if (parsed.ok) next.push(parsed.value);
                else errs.push(`File ${i + 1}: ${parsed.error}`);
              });
              setFiles((f) => [...f, ...next]);
              setErrors(errs);
            }}
          />
          <select
            className="select"
            style={{ maxWidth: 260 }}
            aria-label="Activity"
            value={activity}
            onChange={(e) => setActivity(e.target.value as ActivityId)}
          >
            {ACTIVITIES.map((a) => (
              <option key={a.id} value={a.id}>
                {a.title}
              </option>
            ))}
          </select>
          <label className="check">
            <input
              type="checkbox"
              checked={includeOffSchedule}
              onChange={(e) => setIncludeOffSchedule(e.target.checked)}
            />
            <span>Include off-schedule runs</span>
          </label>
          {files.length > 0 && (
            <>
              <button type="button" className="btn btn-sm btn-secondary" onClick={exportCsv}>
                Save as CSV
              </button>
              <button
                type="button"
                className="btn btn-sm btn-secondary"
                onClick={() => setFiles([])}
              >
                Clear
              </button>
            </>
          )}
        </div>
        <p className="small muted">
          {files.length} {files.length === 1 ? 'file' : 'files'} loaded · {selected.length} counted
          for {meta.title.toLowerCase()} (runs where the student looked in between are left out).
        </p>
        {errors.length > 0 && (
          <ul className="error-text" role="alert">
            {errors.map((e) => (
              <li key={e}>{e}</li>
            ))}
          </ul>
        )}
      </section>

      {selected.length > 0 && (
        <>
          <section className="grid-2">
            <div className="card compare-cell">
              <div className="label">Did better with {meta.conditions[0].toLowerCase()}</div>
              <div className="value">{shareAbove(gaps)}%</div>
              <div className="sub">
                of {selected.length} students · published: {published.didBetter}
              </div>
            </div>
            <div className="card compare-cell">
              <div className="label">
                Expected {meta.conditions[1].toLowerCase()} to be as good or better
              </div>
              <div className="value">
                {predictedGaps.length === 0 ? '–' : `${100 - shareAbove(predictedGaps)}%`}
              </div>
              <div className="sub">
                of {predictedGaps.length} with predictions · published: {published.feltOther}
              </div>
            </div>
          </section>

          <section className="card">
            <PairedBars
              title={`Class means: predicted and scored, by condition (n = ${selected.length})`}
              groups={[
                ...(firstPred.length > 0 && secondPred.length > 0
                  ? [
                      {
                        label: 'Predicted',
                        values: [Math.round(mean(firstPred)), Math.round(mean(secondPred))] as [
                          number,
                          number,
                        ],
                      },
                    ]
                  : []),
                {
                  label: 'Scored',
                  values: [Math.round(mean(first)), Math.round(mean(second))] as [number, number],
                },
                { label: 'Published', values: published.scored },
              ]}
              series={meta.conditions}
            />
            <p className="small muted">
              Median gap: {median(gaps)} points in favour of {meta.conditions[0].toLowerCase()}.{' '}
              {published.note}
            </p>
          </section>

          <section className="card">
            <QuadrantPlot
              title="Each student: how much better they expected the research-favoured way to do, against how much better it did"
              points={points}
              xLabel="Expected advantage (points)"
              yLabel="Actual advantage (points)"
            />
          </section>

          <section className="card stack">
            <h3>Every counted run</h3>
            <table>
              <thead>
                <tr>
                  <th>Code</th>
                  <th className="num">{meta.conditions[0]} predicted</th>
                  <th className="num">{meta.conditions[0]} scored</th>
                  <th className="num">{meta.conditions[1]} predicted</th>
                  <th className="num">{meta.conditions[1]} scored</th>
                  <th className="num">Gap</th>
                </tr>
              </thead>
              <tbody>
                {selected.map((f) => {
                  const [a, b] = f.result.conditions;
                  return (
                    <tr key={`${f.participantCode}-${f.completedAt}`}>
                      <td>{f.participantCode}</td>
                      <td className="num">{a?.predictedPct ?? '–'}</td>
                      <td className="num">{a?.scoredPct}</td>
                      <td className="num">{b?.predictedPct ?? '–'}</td>
                      <td className="num">{b?.scoredPct}</td>
                      <td className="num">
                        {f.result.gapPct > 0 ? `+${f.result.gapPct}` : f.result.gapPct}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </section>
        </>
      )}
    </div>
  );
}

function publishedFor(activity: ActivityId): {
  didBetter: string;
  feltOther: string;
  scored: [number, number];
  note: string;
} {
  switch (activity) {
    case 'interleaving':
      return {
        didBetter: `${PUBLISHED.interleaving.didBetterWithInterleavingPct}%`,
        feltOther: `${PUBLISHED.interleaving.ratedBlockingAsGoodOrBetterPct}%`,
        scored: [PUBLISHED.interleaving.interleavedPct, PUBLISHED.interleaving.blockedPct],
        note: 'Published: Yan, Bjork and Bjork (2016), Experiment 1A; shares from Kornell and Bjork (2008).',
      };
    case 'retrieval':
      return {
        didBetter: 'most',
        feltOther: 'about half (predictions were equal)',
        scored: [PUBLISHED.retrieval.oneWeek.recallPct, PUBLISHED.retrieval.oneWeek.rereadPct],
        note: 'Published: Roediger and Karpicke (2006), Experiment 2, one week.',
      };
    case 'spacing':
      return {
        didBetter: `${PUBLISHED.spacing.spacingBetterForPct}%`,
        feltOther: `${PUBLISHED.spacing.believedMassingBetterPct}%`,
        scored: [0, 0],
        note: 'Published shares from Kornell (2009); that paper reports proportions rather than the two means, so the published bars are left at zero.',
      };
    case 'problems':
      return {
        didBetter: 'most',
        feltOther: 'not reported',
        scored: [PUBLISHED.problems.interleavedPct, PUBLISHED.problems.blockedPct],
        note: 'Published: Rohrer and Taylor (2007), test one week later.',
      };
  }
}
