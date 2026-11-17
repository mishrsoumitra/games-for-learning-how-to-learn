import { useCallback, useEffect, useMemo, useState } from 'react';
import { PUBLISHED } from '../../content/research.ts';
import { pairById } from '../../content/swahili.ts';
import { useSettings } from '../../data/repo.ts';
import type { Run } from '../../data/schemas.ts';
import { FeedbackCard, type Feedback } from '../../components/FeedbackCard.tsx';
import { HonestyQuestion } from '../../components/HonestyQuestion.tsx';
import { LineChart } from '../../components/charts/LineChart.tsx';
import { PredictionSlider } from '../../components/PredictionSlider.tsx';
import { ResultSheet } from '../../components/ResultSheet.tsx';
import { RunGuard } from '../../components/RunGuard.tsx';
import { Stage } from '../../components/Stage.tsx';
import { TypedAnswer } from '../../components/TypedAnswer.tsx';
import { useClock, useCountdown } from '../../components/useTicker.ts';
import { WaitScreen } from '../../components/WaitScreen.tsx';
import { WordPairCard } from '../../components/WordPairCard.tsx';
import { dateForDay, formatDate } from '../../lib/dates.ts';
import { finishRun, saveRunState } from '../common.ts';
import {
  advanceLearn,
  beginTask,
  computeResult,
  CURVE_POINTS,
  currentItemId,
  currentSession,
  currentTask,
  finalTestDone,
  lastPassAccuracy,
  parseState,
  recordAttempt,
  recordFinalPredictions,
  recordHonesty,
  recordRating,
  sessionGate,
  sessionTitle,
  startSession,
  type SpacingState,
  type Task,
} from './engine.ts';

const FEEDBACK_SECONDS = 2;

export default function SpacingRun() {
  return (
    <RunGuard activity="spacing" parse={parseState}>
      {(run, state) => <Screen run={run} state={state} />}
    </RunGuard>
  );
}

function needsOrder(task: Task | undefined): boolean {
  return (
    task?.kind === 'learn-curve' ||
    task?.kind === 'pass' ||
    task?.kind === 'curve-test' ||
    task?.kind === 'final-test'
  );
}

function Screen({ run, state }: { run: Run; state: SpacingState }) {
  const settings = useSettings();
  const now = useClock(15_000);
  const gate = sessionGate(run, state, settings.teacher, new Date(now));
  const today = gate.today;
  const task = currentTask(state);
  const seed = run.seed ^ (state.sessionIndex * 1000 + state.taskIndex * 10 + state.passIndex);

  const save = useCallback(
    (next: SpacingState) => {
      if (finalTestDone(next))
        void finishRun(run, next, computeResult(next), run.offSchedule || next.offSchedule);
      else void saveRunState(run, next, { offSchedule: run.offSchedule || next.offSchedule });
    },
    [run],
  );

  // When a task that works through a list begins, shuffle the list once and save it.
  useEffect(() => {
    if (state.phase === 'session' && needsOrder(task) && state.order.length === 0 && gate.ready) {
      save(beginTask(state, seed));
    }
  }, [state, task, gate.ready, save, seed]);

  const session = currentSession(state);

  if (state.phase === 'done' || !session) {
    return <Done run={run} state={state} />;
  }

  if (state.phase === 'waiting' || !gate.ready) {
    const isCurveWait = gate.waitMinutes > 0;
    const title = sessionTitle(session, state.sessionIndex, state.sessions.length);
    return (
      <div className="narrow stack-lg">
        {finalTestDone(state) && <Done run={run} state={state} compact />}
        {gate.ready ? (
          <section className="card stack">
            <h2>{title} is open</h2>
            <p>{describeSession(session)}</p>
            {gate.late && (
              <p className="notice notice-warn">
                This was planned for day {gate.dueDay}; today is day {gate.today}. Do it now and the
                app will move the remaining sessions along by the same number of days.
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
            what={isCurveWait ? 'the ten-minute check' : title.toLowerCase()}
            waitMinutes={gate.waitMinutes}
          />
        )}
        <Plan state={state} startedAt={run.startedAt} />
      </div>
    );
  }

  if (!task) return null;
  const count =
    state.order.length > 0
      ? `${Math.min(state.order.length, state.itemIndex + 1)} of ${state.order.length}`
      : undefined;

  switch (task.kind) {
    case 'learn-curve':
      return state.passIndex === 0 ? (
        <LearnLook
          state={state}
          count={count}
          onAdvance={() => save(advanceLearn(state, today, seed + 1))}
        />
      ) : (
        <TypedPass
          key="learn-pass"
          state={state}
          label="Forgetting-curve set · first recall pass"
          frame="none"
          count={count}
          feedback
          onTyped={(typed) => {
            const { lastCorrect, lastId, ...next } = recordAttempt(state, typed, today, seed + 2);
            save(next);
            return { lastCorrect, lastId };
          }}
        />
      );
    case 'pass':
      return (
        <TypedPass
          key={`pass-${task.set}-${state.passIndex}`}
          state={state}
          label={
            task.set === 'spaced'
              ? `Spaced set · day ${session.day} pass`
              : `Crammed set · pass ${state.passIndex + 1} of ${task.passes}`
          }
          frame={task.set === 'spaced' ? 'a' : 'b'}
          count={count}
          feedback
          onTyped={(typed) => {
            const { lastCorrect, lastId, ...next } = recordAttempt(
              state,
              typed,
              today,
              seed + 3 + state.passIndex,
            );
            save(next);
            return { lastCorrect, lastId };
          }}
        />
      );
    case 'rate':
      return (
        <RateSet
          key={`rate-${task.set}-${session.day}`}
          set={task.set}
          n={task.set === 'spaced' ? state.spacedIds.length : state.crammedIds.length}
          testDay={state.testDay}
          onDone={(v) => save(recordRating(state, v, today))}
        />
      );
    case 'curve-test':
      return (
        <TypedPass
          key={`curve-${task.fifth}`}
          state={state}
          label={`Forgetting-curve check · ${CURVE_POINTS[task.fifth] ?? ''} after learning`}
          frame="none"
          count={count}
          feedback={false}
          onTyped={(typed) => {
            const { lastCorrect, lastId, ...next } = recordAttempt(state, typed, today, seed + 4);
            save(next);
            return { lastCorrect, lastId };
          }}
        />
      );
    case 'final-predict':
      return (
        <FinalPredict
          state={state}
          onDone={(a, b) => save(recordFinalPredictions(state, a, b, today))}
        />
      );
    case 'final-test':
      return (
        <TypedPass
          key="final"
          state={state}
          label="Test day · all forty words"
          frame="none"
          count={count}
          feedback={false}
          onTyped={(typed) => {
            const { lastCorrect, lastId, ...next } = recordAttempt(state, typed, today, seed + 5);
            save(next);
            return { lastCorrect, lastId };
          }}
        />
      );
    case 'honesty':
      return (
        <Stage>
          <HonestyQuestion onAnswer={(h) => save(recordHonesty(state, h, today))} />
        </Stage>
      );
  }
}

function describeSession(session: { tasks: Task[] }): string {
  const parts: string[] = [];
  for (const t of session.tasks) {
    if (t.kind === 'learn-curve') parts.push('learn the forgetting-curve set');
    if (t.kind === 'pass')
      parts.push(
        t.set === 'spaced' ? 'one pass over the spaced set' : 'four passes over the crammed set',
      );
    if (t.kind === 'curve-test') parts.push('a four-word forgetting-curve check');
    if (t.kind === 'final-test') parts.push('the forty-word test');
  }
  const text = parts.join(', then ');
  return text.length > 0 ? `Today: ${text}.` : '';
}

function LearnLook({
  state,
  count,
  onAdvance,
}: {
  state: SpacingState;
  count: string | undefined;
  onAdvance: () => void;
}) {
  const id = currentItemId(state);
  const pair = id ? pairById(id) : undefined;
  useCountdown(state.secondsPerPair, onAdvance, `look-${state.itemIndex}`);
  if (!pair) return null;
  return (
    <div className="stack">
      <Stage label="Forgetting-curve set · first look" count={count}>
        <WordPairCard pair={pair} showAnswer />
      </Stage>
      <p className="small muted">
        Read each pair. Then you will try to recall each one once, with the answer shown.
      </p>
    </div>
  );
}

function TypedPass({
  state,
  label,
  frame,
  count,
  feedback: showFeedback,
  onTyped,
}: {
  state: SpacingState;
  label: string;
  frame: 'a' | 'b' | 'none';
  count: string | undefined;
  feedback: boolean;
  onTyped: (typed: string) => { lastCorrect: boolean; lastId: string };
}) {
  const id = currentItemId(state);
  const pair = id ? pairById(id) : undefined;
  const [fb, setFb] = useState<Feedback | null>(null);
  const key = `${state.sessionIndex}-${state.taskIndex}-${state.passIndex}-${state.itemIndex}`;
  if (!pair && !fb) return null;
  return (
    <div className="stack">
      <Stage frame={frame} label={label} count={count}>
        {fb ? (
          <FeedbackCard feedback={fb} seconds={FEEDBACK_SECONDS} onDone={() => setFb(null)} />
        ) : (
          pair && (
            <>
              <div className="cue" lang="sw">
                {pair.cue}
              </div>
              <TypedAnswer
                prompt="What does it mean in English?"
                itemKey={key}
                onSubmit={(typed) => {
                  const { lastCorrect } = onTyped(typed);
                  if (showFeedback) setFb({ pair, typed, correct: lastCorrect, key });
                }}
              />
            </>
          )
        )}
      </Stage>
      {state.order.length > 0 && (
        <progress
          className="progress"
          value={state.itemIndex}
          max={state.order.length}
          aria-label="Progress"
        />
      )}
      <p className="small muted">
        {showFeedback
          ? 'Type what you remember, or leave it blank. The answer is shown after each one.'
          : 'This is a check. No answers are shown. Leave it blank if nothing comes.'}
      </p>
    </div>
  );
}

function RateSet({
  set,
  n,
  testDay,
  onDone,
}: {
  set: 'spaced' | 'crammed';
  n: number;
  testDay: number;
  onDone: (v: number) => void;
}) {
  const [value, setValue] = useState(Math.round(n / 2));
  return (
    <Stage
      frame={set === 'spaced' ? 'a' : 'b'}
      label={set === 'spaced' ? 'Spaced set' : 'Crammed set'}
    >
      <h2>How well do you know this set now?</h2>
      <p>
        On day {testDay} you will be tested on all {n} of these words with no answers shown. How
        many will you get right?
      </p>
      <PredictionSlider label="Your prediction" max={n} value={value} onChange={setValue} />
      <button type="button" className="btn btn-lg" onClick={() => onDone(value)}>
        Lock it in
      </button>
    </Stage>
  );
}

function FinalPredict({
  state,
  onDone,
}: {
  state: SpacingState;
  onDone: (spaced: number, crammed: number) => void;
}) {
  const n = state.spacedIds.length;
  const [spaced, setSpaced] = useState(Math.round(n / 2));
  const [crammed, setCrammed] = useState(Math.round(n / 2));
  return (
    <Stage label="Test day · your prediction">
      <h2>Before the test</h2>
      <p>
        One set you studied a little on four days. The other you studied four times in one sitting.
        Same number of passes. How many of each 20 will you get right now?
      </p>
      <PredictionSlider label="The spaced set" max={n} value={spaced} onChange={setSpaced} />
      <PredictionSlider label="The crammed set" max={n} value={crammed} onChange={setCrammed} />
      <button type="button" className="btn btn-lg" onClick={() => onDone(spaced, crammed)}>
        Lock it in and start the test
      </button>
    </Stage>
  );
}

function Plan({ state, startedAt }: { state: SpacingState; startedAt: string }) {
  return (
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
              <td>{formatDate(dateForDay(startedAt, s.day))}</td>
              <td>{sessionTitle(s, i, state.sessions.length)}</td>
              <td>
                {s.doneAt
                  ? s.actualDay !== undefined && s.actualDay > s.day
                    ? `Yes, on day ${s.actualDay}`
                    : 'Yes'
                  : i === state.sessionIndex
                    ? 'Next'
                    : ''}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}

function Done({
  run,
  state,
  compact = false,
}: {
  run: Run;
  state: SpacingState;
  compact?: boolean;
}) {
  const result = useMemo(() => run.result ?? computeResult(state), [run.result, state]);
  useEffect(() => {
    if (run.status !== 'complete' && finalTestDone(state)) void finishRun(run, state, result);
  }, [run, state, result]);
  const p = PUBLISHED.spacing;
  const curvePoints = CURVE_POINTS.map((label, i) => {
    const r = state.curveResults.find((c) => c.fifth === i);
    return { label, value: r ? Math.round((100 * r.correct) / Math.max(1, r.n)) : null };
  });
  const lastSpaced = lastPassAccuracy(state, 'spaced');
  const lastCrammed = lastPassAccuracy(state, 'crammed');
  const firstRating = state.ratings.find((r) => r.set === 'spaced');
  const crammedRating = state.ratings.find((r) => r.set === 'crammed');
  const curve = state.curve && state.curveResults.length > 0 && (
    <section className="card stack">
      <h3>Your forgetting curve</h3>
      <LineChart
        title="Share of the forgetting-curve words recalled, by time since learning them"
        points={curvePoints}
        seriesName="You"
      />
      <p className="small muted">
        Each point is four different words, so the curve is rough. Ebbinghaus found the same shape
        in 1885: most forgetting happens early, then it flattens. A pass at the right moment lifts
        the curve and slows the next drop. That is all spacing is.
      </p>
    </section>
  );
  if (compact) {
    return (
      <section className="card stack">
        <h3>Your test-day result</h3>
        <p className="sheet-verdict">
          Spaced {result.conditions[0]?.scoredPct}%, crammed {result.conditions[1]?.scoredPct}%.
        </p>
        {curve}
        <p className="small muted">
          The full result sheet is in Results. The forgetting curve finishes on day 7.
        </p>
      </section>
    );
  }
  return (
    <div className="narrow stack-lg">
      <div className="page-head">
        <p className="kicker">Cram or space</p>
        <h1>Your result</h1>
        <p className="lead">
          Spaced means the set you studied over four days. Crammed means the set you studied four
          times on one day.
        </p>
      </div>
      <ResultSheet
        run={run}
        result={result}
        published={[
          {
            label: 'Kornell, 2009: share of students who did better with',
            values: [`${p.spacingBetterForPct}%`, '6%'],
          },
          {
            label:
              'Kornell, 2009: share who believed, after session one, that this way worked better',
            values: [`${100 - p.believedMassingBetterPct}%`, `${p.believedMassingBetterPct}%`],
          },
        ]}
        publishedNote="Kornell (2009) used GRE vocabulary flashcards: one big stack across days against four small stacks crammed. After the first session 72% believed cramming had worked better. The remaining 4% of students showed no difference. Cepeda and colleagues (2008) found that for a test one week away the best single gap between study sessions is about one to three days."
        theory={
          <>
            <p>
              On day 3, the crammed set felt great. By the fourth pass in a row you were getting
              most of them right, and it felt like you knew them. The spaced set, on each new day,
              started with a struggle: half the words had slipped since yesterday.
            </p>
            <p>
              That struggle is the work. When you come back after a night and drag a word out of
              memory, you are practising exactly what the test asks, and each time you do it the
              word sticks for longer. Passes in a row do not do that: by pass three the word is
              still fresh from pass two, so there is nothing to retrieve, only something to
              recognise.
            </p>
            <p>
              You saw this yourself the night before an exam. It all feels known at 2 a.m., and in
              the hall the next week half of it is gone. Four short sittings beat one long one with
              the same total time.
            </p>
          </>
        }
      >
        <section className="card stack">
          <h3>How it felt while you studied</h3>
          <ul>
            {firstRating && (
              <li>
                After your first session you expected to get {firstRating.value} of 20 spaced words
                right on test day.
              </li>
            )}
            {crammedRating && (
              <li>
                After cramming you expected {crammedRating.value} of 20 crammed words right on test
                day.
              </li>
            )}
            {lastSpaced !== null && lastCrammed !== null && (
              <li>
                On its last pass before the test, you got {lastCrammed}% of the crammed set right
                and {lastSpaced}% of the spaced set. The test said {result.conditions[1]?.scoredPct}
                % and {result.conditions[0]?.scoredPct}%.
              </li>
            )}
          </ul>
        </section>
        {curve}
        <section className="card stack">
          <h3>What to do with this</h3>
          <p>
            Split your revision for a topic across days, not across hours of one day. For a test in
            a week, review one to three days after you first learn something, then again a few days
            later. The Flashcards page schedules this for you.
          </p>
        </section>
      </ResultSheet>
    </div>
  );
}
