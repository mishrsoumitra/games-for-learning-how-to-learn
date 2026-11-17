import type { ReactNode } from 'react';
import { Link } from 'react-router';
import { feelingVersusResult } from '../activities/common.ts';
import { buildResultFile } from '../data/exportImport.ts';
import type { Run, RunResult } from '../data/schemas.ts';
import { downloadText, fileName } from '../lib/download.ts';
import { PairedBars } from './charts/PairedBars.tsx';

interface Props {
  run: Run;
  result: RunResult;
  /** Published figures to show beside the student's own, as a short table. */
  published: readonly { label: string; values: readonly [string, string] }[];
  publishedNote: string;
  /** The plain explanation of why the result happens. */
  theory: ReactNode;
  children?: ReactNode;
}

/**
 * The reveal. In this order, because each step is needed for a student to update what they
 * believe (Tullis, Finley and Benjamin, 2013): what you predicted, what you scored, that the
 * items were assigned at random so it was not "easier items", the published numbers, and the
 * reason. Individual results are noisy: about one student in five will not see the pattern
 * on a single run, and the sheet says so.
 */
export function ResultSheet({ run, result, published, publishedNote, theory, children }: Props) {
  const [first, second] = result.conditions;
  if (!first || !second) return null;
  const sentence = feelingVersusResult(result);
  const agrees = result.gapPct > 0;
  const groups = [
    ...(first.predictedPct !== null && second.predictedPct !== null
      ? [
          {
            label: 'You predicted',
            values: [first.predictedPct, second.predictedPct] as [number, number],
          },
        ]
      : []),
    { label: 'You scored', values: [first.scoredPct, second.scoredPct] as [number, number] },
  ];
  return (
    <div className="stack-lg">
      <section className="sheet stack">
        <p className="kicker">Your result</p>
        <p className="sheet-verdict">{sentence}</p>
        <div className="compare">
          {result.conditions.map((c, i) => (
            <div className="compare-cell" key={c.key}>
              <div className="label">
                <span className={`swatch swatch-${i + 1}`} />
                {c.label}
              </div>
              <div className="value">{c.scoredPct}%</div>
              <div className="sub">
                {c.correct} of {c.n} right
                {c.predictedPct !== null && <>, you predicted about {c.predictedPct}%</>}
              </div>
            </div>
          ))}
        </div>
        <PairedBars
          title="What you predicted and what you scored, by condition"
          groups={groups}
          series={[first.label, second.label]}
        />
        <p className={agrees ? 'notice notice-good' : 'notice notice-warn'}>
          {agrees
            ? `Your data match the published pattern: ${first.label.toLowerCase()} did better.`
            : `Your data do not show the published pattern this time. That happens to roughly one student in five on a single run, because a handful of items is a small sample. The class average is the number to trust; compare yours with the class in Results.`}
        </p>
        {result.honesty !== 'clean' && (
          <p className="notice notice-bad">
            You said you may have looked at the material between sessions. The teacher's class plot
            leaves such runs out. Your own numbers are still shown here.
          </p>
        )}
        {run.offSchedule && (
          <p className="notice notice-warn">
            A session in this run happened later than planned, so the gaps are not the ones the
            research used. Read the result with that in mind.
          </p>
        )}
      </section>

      <section className="card stack">
        <h3>Was it just easier items?</h3>
        <p>
          No. Which items went into which condition was decided by a random number when you started,
          and so was the order of the two phases. Another student got a different split. That is why
          the two conditions can be compared.
        </p>
      </section>

      <section className="card stack">
        <h3>What the research found</h3>
        <table>
          <thead>
            <tr>
              <th>Study</th>
              <th>{first.label}</th>
              <th>{second.label}</th>
            </tr>
          </thead>
          <tbody>
            {published.map((row) => (
              <tr key={row.label}>
                <td>{row.label}</td>
                <td>{row.values[0]}</td>
                <td>{row.values[1]}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="small muted">{publishedNote}</p>
      </section>

      <section className="card stack">
        <h3>Why this happens</h3>
        {theory}
      </section>

      {children}

      <div className="btn-group">
        <button
          type="button"
          className="btn btn-secondary"
          onClick={() => {
            const file = buildResultFile(run);
            if (file)
              downloadText(
                fileName(`study-lab-result-${run.activity}`, 'json'),
                JSON.stringify(file, null, 2),
              );
          }}
        >
          Save my result as a file for the class plot
        </button>
        <Link className="btn btn-secondary" to="/results">
          All my results
        </Link>
      </div>
    </div>
  );
}
