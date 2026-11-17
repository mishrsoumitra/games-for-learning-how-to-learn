import { useCallback, useEffect, useMemo, useState } from 'react';
import { PUBLISHED } from '../../content/research.ts';
import { formatVolume, SOLIDS, solidById, type SolidId } from '../../content/solids.ts';
import { useSettings } from '../../data/repo.ts';
import type { Run } from '../../data/schemas.ts';
import { HonestyQuestion } from '../../components/HonestyQuestion.tsx';
import { PairedBars } from '../../components/charts/PairedBars.tsx';
import { PredictionSlider } from '../../components/PredictionSlider.tsx';
import { ResultSheet } from '../../components/ResultSheet.tsx';
import { RunGuard } from '../../components/RunGuard.tsx';
import { SolidFigure } from '../../components/SolidFigure.tsx';
import { Stage } from '../../components/Stage.tsx';
import { TypedAnswer } from '../../components/TypedAnswer.tsx';
import { useClock } from '../../components/useTicker.ts';
import { WaitScreen } from '../../components/WaitScreen.tsx';
import { dateForDay, formatDate } from '../../lib/dates.ts';
import { finishRun, saveRunState } from '../common.ts';
import {
  accuracy,
  advanceProblem,
  advanceTutorial,
  computeResult,
  currentProblem,
  currentSession,
  parseState,
  recordAnswer,
  recordHonesty,
  recordPredictions,
  sessionGate,
  startSession,
  TEST_PER_SOLID,
  type PlannedProblem,
  type ProblemsState,
} from './engine.ts';

export default function ProblemsRun() {
  return (
    <RunGuard activity="problems" parse={parseState}>
      {(run, state) => <Screen run={run} state={state} />}
    </RunGuard>
  );
}

function Screen({ run, state }: { run: Run; state: ProblemsState }) {
  const settings = useSettings();
  const now = useClock(30_000);
  const gate = sessionGate(run, state, settings.teacher, new Date(now));
  const save = useCallback(
    (next: ProblemsState) =>
      void saveRunState(run, next, { offSchedule: run.offSchedule || next.offSchedule }),
    [run],
  );
  const session = currentSession(state);

  if (state.phase === 'done' || !session) return <Done run={run} state={state} />;

  if (state.phase === 'waiting' || !gate.ready) {
    const title =
      session.kind === 'test' ? 'The test' : `Practice session ${state.sessionIndex + 1}`;
    return (
      <div className="narrow stack-lg">
        {gate.ready ? (
          <section className="card stack">
            <h2>{title} is open</h2>
            <p>
              {session.kind === 'test'
                ? 'Eight problems, two per solid, mixed. No formula sheet and no feedback until the end. Keep a calculator ready.'
                : 'Sixteen problems. Two solids come in blocks, two come mixed. You see the right answer after each one.'}
            </p>
            {gate.late && (
              <p className="notice notice-warn">
                This was planned for day {gate.dueDay}; today is day {gate.today}. The remaining
                sessions move along by the same number of days.
              </p>
            )}
            <button type="button" className="btn btn-lg" onClick={() => save(startSession(state))}>
              Start
            </button>
          </section>
        ) : (
          <WaitScreen
            startedAt={run.startedAt}
            dueDay={gate.dueDay}
            today={gate.today}
            what={title.toLowerCase()}
          />
        )}
        <section className="card stack">
          <h3>Your plan</h3>
          <table>
            <thead>
              <tr>
                <th>Day</th>
                <th>Date</th>
                <th>What</th>
                <th>Done</th>
              </tr>
            </thead>
            <tbody>
              {state.sessions.map((s, i) => (
                <tr key={s.day}>
                  <td>{s.day}</td>
                  <td>{formatDate(dateForDay(run.startedAt, s.day))}</td>
                  <td>{s.kind === 'test' ? 'Test' : `Practice ${i + 1}`}</td>
                  <td>{s.doneAt ? 'Yes' : i === state.sessionIndex ? 'Next' : ''}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </div>
    );
  }

  if (state.sessionIndex === 0 && !state.tutorialDone) {
    return <Tutorial state={state} onNext={() => save(advanceTutorial(state))} />;
  }

  if (state.predictStep === 0) {
    const problem = currentProblem(state);
    if (!problem) return null;
    return (
      <ProblemScreen
        key={problem.id}
        state={state}
        problem={problem}
        practice={session.kind === 'practice'}
        onDone={(typed) => {
          const { lastCorrect: _c, ...recorded } = recordAnswer(state, typed);
          save(advanceProblem(recorded));
        }}
      />
    );
  }

  if (session.kind === 'practice') {
    return (
      <Predict state={state} onDone={(b, i) => save(recordPredictions(state, b, i, gate.today))} />
    );
  }
  return (
    <Stage>
      <HonestyQuestion onAnswer={(h) => save(recordHonesty(state, h, gate.today))} />
    </Stage>
  );
}

function Tutorial({ state, onNext }: { state: ProblemsState; onNext: () => void }) {
  const solid = SOLIDS[state.tutorialIndex];
  if (!solid) return null;
  const example: Record<string, number> = {};
  solid.dims.forEach((d, i) => {
    example[d.key] = d.min + 1 + i;
  });
  const answer = solid.volume(example);
  return (
    <div className="stack">
      <Stage label={`Tutorial · ${state.tutorialIndex + 1} of ${SOLIDS.length}`}>
        <h2>{solid.name}</h2>
        <SolidFigure solidId={solid.id} />
        <p>{solid.tellApart}</p>
        <p className="cue-answer">{solid.formula}</p>
        <p className="small">{solid.formulaWords}</p>
        <div className="card stack" style={{ textAlign: 'left', maxWidth: 480 }}>
          <h4>Worked example</h4>
          <p>{solid.dims.map((d) => `${d.label} ${d.symbol} = ${example[d.key]}`).join(', ')}.</p>
          <p>Volume = {formatVolume(answer)}. Check it on your calculator now.</p>
        </div>
        <button type="button" className="btn btn-lg" onClick={onNext}>
          {state.tutorialIndex + 1 < SOLIDS.length ? 'Next solid' : 'Start the problems'}
        </button>
      </Stage>
      <p className="small muted">
        Learn the formula now. It will not be shown during the problems.
      </p>
    </div>
  );
}

function ProblemScreen({
  state,
  problem,
  practice,
  onDone,
}: {
  state: ProblemsState;
  problem: PlannedProblem;
  practice: boolean;
  onDone: (typed: string) => void;
}) {
  const solid = solidById(problem.solidId);
  const session = currentSession(state);
  const [typed, setTyped] = useState<string | null>(null);
  const total = session?.problems.length ?? 0;
  const frame = practice ? (problem.condition === 'blocked' ? 'a' : 'b') : 'none';
  const label = practice
    ? problem.condition === 'blocked'
      ? 'Practice · one solid at a time'
      : 'Practice · solids mixed'
    : 'Test';
  const correct = typed !== null && (() => recordAnswer(state, typed).lastCorrect)();
  return (
    <div className="stack">
      <Stage frame={frame} label={label} count={`${state.itemIndex + 1} of ${total}`}>
        <h2>{solid.name}</h2>
        <SolidFigure solidId={problem.solidId} dims={problem.dims} />
        <p>
          {solid.dims.map((d) => `${d.label} ${d.symbol} = ${problem.dims[d.key]}`).join(', ')}.
          Find the volume. Round to one decimal place.
        </p>
        {typed === null ? (
          <TypedAnswer
            prompt="Volume"
            placeholder="e.g. 123.4"
            inputMode="decimal"
            buttonLabel={practice ? 'Check' : 'Next'}
            itemKey={problem.id}
            onSubmit={(t) => {
              if (practice) setTyped(t);
              else onDone(t);
            }}
          />
        ) : (
          <div className="stack">
            <p className={correct ? 'feedback-right' : 'feedback-wrong'}>
              {correct
                ? 'Right.'
                : `Not quite. You typed ${typed.trim() === '' ? 'nothing' : typed}.`}
            </p>
            <p className="cue-answer">{solid.formula}</p>
            <p>Volume = {formatVolume(problem.answer)}</p>
            <button type="button" className="btn" onClick={() => onDone(typed)}>
              Next problem
            </button>
          </div>
        )}
      </Stage>
      <progress className="progress" value={state.itemIndex} max={total} aria-label="Progress" />
    </div>
  );
}

const names = (ids: SolidId[]) => ids.map((id) => solidById(id).name.toLowerCase()).join(' and ');
const pct = (a: { correct: number; n: number }) =>
  a.n === 0 ? 0 : Math.round((100 * a.correct) / a.n);

function Predict({
  state,
  onDone,
}: {
  state: ProblemsState;
  onDone: (blocked: number, interleaved: number) => void;
}) {
  const n = TEST_PER_SOLID * 2;
  const [blocked, setBlocked] = useState(Math.round(n / 2));
  const [interleaved, setInterleaved] = useState(Math.round(n / 2));
  const b = accuracy(state, state.sessionIndex, 'blocked');
  const i = accuracy(state, state.sessionIndex, 'interleaved');
  return (
    <Stage label="Your prediction">
      <h2>How will the test go?</h2>
      <p>
        In this session you got {b.correct} of {b.n} right on the blocked solids (
        {names(state.blockedSolids)}) and {i.correct} of {i.n} right on the mixed solids (
        {names(state.interleavedSolids)}). The test has {n} problems on each pair, with no formula
        sheet.
      </p>
      <PredictionSlider
        label={`Blocked solids (${names(state.blockedSolids)}): how many of ${n}?`}
        max={n}
        value={blocked}
        onChange={setBlocked}
      />
      <PredictionSlider
        label={`Mixed solids (${names(state.interleavedSolids)}): how many of ${n}?`}
        max={n}
        value={interleaved}
        onChange={setInterleaved}
      />
      <button type="button" className="btn btn-lg" onClick={() => onDone(blocked, interleaved)}>
        Lock it in
      </button>
    </Stage>
  );
}

function Done({ run, state }: { run: Run; state: ProblemsState }) {
  const result = useMemo(() => run.result ?? computeResult(state), [run.result, state]);
  useEffect(() => {
    if (run.status !== 'complete') void finishRun(run, state, result);
  }, [run, state, result]);
  const p = PUBLISHED.problems;
  const groups = [
    {
      label: 'Practice 1',
      values: [pct(accuracy(state, 0, 'interleaved')), pct(accuracy(state, 0, 'blocked'))] as [
        number,
        number,
      ],
    },
    {
      label: 'Practice 2',
      values: [pct(accuracy(state, 1, 'interleaved')), pct(accuracy(state, 1, 'blocked'))] as [
        number,
        number,
      ],
    },
    {
      label: 'Test',
      values: [result.conditions[0]?.scoredPct ?? 0, result.conditions[1]?.scoredPct ?? 0] as [
        number,
        number,
      ],
    },
  ];
  return (
    <div className="narrow stack-lg">
      <div className="page-head">
        <p className="kicker">Mixed problem set</p>
        <h1>Your result</h1>
        <p className="lead">
          Mixed means the two solids whose problems came mixed up. Blocked means the two whose
          problems came in blocks.
        </p>
      </div>
      <ResultSheet
        run={run}
        result={result}
        published={[
          {
            label: 'Rohrer and Taylor, 2007, test one week later',
            values: [`${p.interleavedPct}%`, `${p.blockedPct}%`],
          },
          {
            label: 'Rohrer and others, 2020, 787 school students, test one month later',
            values: ['61%', '38%'],
          },
        ]}
        publishedNote="In Rohrer and Taylor (2007) the mixed group did worse during practice and three times better on the test. Brunmair and Richter's 2019 meta-analysis puts the average effect for maths at g = 0.34, smaller and more variable than for paintings, and finds that mixing unrelated word lists does not help at all. Mixing works when the kinds of problem are easy to confuse."
        theory={
          <>
            <p>
              In a block, the first problem tells you which formula to use, and the next three are
              the same. You never have to look at a solid and decide what it is. It feels smooth,
              and the practice score is high.
            </p>
            <p>
              Mixed, every problem starts with a decision: which solid is this, and which formula
              goes with it? That decision is the hard part in the test, and in the exam, where the
              problems arrive with no label for which chapter they're from. Practising it feels
              worse and scores lower during practice. A week later it is the thing you still have.
            </p>
          </>
        }
      >
        <section className="card stack">
          <h3>Practice looked one way, the test the other</h3>
          <PairedBars
            title="Accuracy in each practice session and in the test, by condition"
            groups={groups}
            series={['Mixed', 'Blocked']}
          />
          <p className="small muted">
            Only four test problems per condition, so one problem is 25 points. Trust the class
            average more than your own single run.
          </p>
        </section>
        <section className="card stack">
          <h3>What to do with this</h3>
          <p>
            After you have learned a method, do not practise it ten times in a row. Mix problems
            from the last three chapters and make yourself choose the method each time. Expect it to
            feel worse. For a brand-new multi-step method, study a worked example first (Yeo and
            Fazio, 2019); mixing is for after that.
          </p>
        </section>
      </ResultSheet>
    </div>
  );
}
