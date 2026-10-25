import { useCallback, useEffect, useMemo, useState } from 'react';
import { PUBLISHED } from '../../content/research.ts';
import { pairById } from '../../content/swahili.ts';
import { useSettings } from '../../data/repo.ts';
import type { Run } from '../../data/schemas.ts';
import { FeedbackCard, type Feedback } from '../../components/FeedbackCard.tsx';
import { HonestyQuestion } from '../../components/HonestyQuestion.tsx';
import { PairedBars } from '../../components/charts/PairedBars.tsx';
import { PredictionSlider } from '../../components/PredictionSlider.tsx';
import { ResultSheet } from '../../components/ResultSheet.tsx';
import { RunGuard } from '../../components/RunGuard.tsx';
import { Stage } from '../../components/Stage.tsx';
import { TypedAnswer } from '../../components/TypedAnswer.tsx';
import { useClock, useCountdown } from '../../components/useTicker.ts';
import { WaitScreen } from '../../components/WaitScreen.tsx';
import { WordPairCard } from '../../components/WordPairCard.tsx';
import { finishRun, saveRunState } from '../common.ts';
import {
  advanceReread,
  advanceStudy,
  afterRecallFeedback,
  computeResult,
  currentBlockCondition,
  currentImmediateId,
  currentPracticeId,
  currentRound,
  currentTestId,
  FEEDBACK_SECONDS,
  immediateScore,
  parseState,
  practiceRecallByRound,
  recordImmediate,
  recordRecall,
  recordTest,
  setHonesty,
  setPredictions,
  startTest,
  testUnlock,
  type RetrievalState,
} from './engine.ts';

export default function RetrievalRun() {
  return (
    <RunGuard activity="retrieval" parse={parseState}>
      {(run, state) => <Screen run={run} state={state} />}
    </RunGuard>
  );
}

function Screen({ run, state }: { run: Run; state: RetrievalState }) {
  const settings = useSettings();
  const save = useCallback((next: RetrievalState) => void saveRunState(run, next), [run]);
  const now = useClock(30_000);

  switch (state.phase) {
    case 'study':
      return <Study state={state} onAdvance={() => save(advanceStudy(state))} />;
    case 'practice':
      return <Practice state={state} save={save} />;
    case 'predict':
      return <Predict state={state} onDone={(a, b) => save(setPredictions(state, a, b))} />;
    case 'immediate':
      return <Immediate state={state} onAnswer={(t) => save(recordImmediate(state, t))} />;
    case 'waiting': {
      const unlock = testUnlock(run, state, settings.teacher, new Date(now));
      return (
        <div className="narrow stack-lg">
          <ImmediateCard state={state} />
          {unlock.ready ? (
            <section className="card stack">
              <h2>Your memory test is open</h2>
              <p>
                Forty Swahili words, one at a time. Type the English. No answers are shown until the
                end. About ten minutes. Do it in one go.
              </p>
              {unlock.late && (
                <p className="notice notice-warn">
                  Today is day {unlock.today}; the test was planned for day {unlock.dueDay}. You can
                  still take it, and the result will say the gap was longer than planned.
                </p>
              )}
              <button
                type="button"
                className="btn btn-lg"
                onClick={() => {
                  const next = startTest(state, unlock.today);
                  void saveRunState(run, next, { offSchedule: run.offSchedule || unlock.late });
                }}
              >
                Start the test
              </button>
            </section>
          ) : (
            <WaitScreen
              startedAt={run.startedAt}
              dueDay={unlock.dueDay}
              today={unlock.today}
              what="the memory test"
            />
          )}
        </div>
      );
    }
    case 'test':
      return <FinalTest state={state} onAnswer={(t) => save(recordTest(state, t))} />;
    case 'honesty':
      return (
        <Stage>
          <HonestyQuestion onAnswer={(h) => save(setHonesty(state, h))} />
        </Stage>
      );
    case 'done':
      return <Done run={run} state={state} />;
  }
}

function Study({ state, onAdvance }: { state: RetrievalState; onAdvance: () => void }) {
  const id = state.studyOrder[state.studyIndex];
  const pair = id ? pairById(id) : undefined;
  useCountdown(state.secondsPerPair, onAdvance, state.studyIndex);
  if (!pair) return null;
  return (
    <div className="stack">
      <Stage
        label="First look · read each pair"
        count={`${state.studyIndex + 1} of ${state.studyOrder.length}`}
      >
        <WordPairCard pair={pair} showAnswer />
      </Stage>
      <progress
        className="progress"
        value={state.studyIndex + 1}
        max={state.studyOrder.length}
        aria-label="Progress"
      />
      <p className="small muted">
        Read the Swahili word and its meaning. The next pair comes by itself.
      </p>
    </div>
  );
}

function Practice({ state, save }: { state: RetrievalState; save: (s: RetrievalState) => void }) {
  const cond = currentBlockCondition(state);
  const round = currentRound(state);
  const id = currentPracticeId(state);
  const pair = id ? pairById(id) : undefined;
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const total = round ? round[cond].length : 0;
  const label = `Round ${state.roundIndex + 1} of ${state.rounds.length} · ${cond === 'reread' ? 'Reread' : 'Recall'}`;
  const frame = cond === 'reread' ? 'a' : 'b';
  const key = `${state.roundIndex}-${state.blockIndex}-${state.itemIndex}`;

  // Reread: shown for a fixed time, then on.
  useCountdown(
    cond === 'reread' ? state.secondsPerPair : 0,
    () => {
      if (cond === 'reread') save(advanceReread(state));
    },
    cond === 'reread' ? key : 'off',
  );

  if (!pair || !round) return null;

  if (cond === 'reread') {
    return (
      <div className="stack">
        <Stage frame={frame} label={label} count={`${state.itemIndex + 1} of ${total}`}>
          <WordPairCard pair={pair} showAnswer />
        </Stage>
        <progress
          className="progress"
          value={state.itemIndex + 1}
          max={total}
          aria-label="Progress"
        />
        <p className="small muted">Reread the pair. The next one comes by itself.</p>
      </div>
    );
  }

  return (
    <div className="stack">
      <Stage
        frame={frame}
        label={label}
        count={`${Math.min(total, state.itemIndex + (feedback ? 0 : 1))} of ${total}`}
      >
        {feedback ? (
          <FeedbackCard
            feedback={feedback}
            seconds={FEEDBACK_SECONDS}
            onDone={() => setFeedback(null)}
          />
        ) : (
          <>
            <div className="cue" lang="sw">
              {pair.cue}
            </div>
            <TypedAnswer
              prompt="What does it mean in English?"
              itemKey={key}
              onSubmit={(typed) => {
                const { lastCorrect, ...recorded } = recordRecall(state, typed);
                setFeedback({ pair, typed, correct: lastCorrect, key });
                save(afterRecallFeedback(recorded));
              }}
            />
          </>
        )}
      </Stage>
      <progress className="progress" value={state.itemIndex} max={total} aria-label="Progress" />
      <p className="small muted">
        Type what you remember, or leave it blank and press Check. The answer is shown after each
        one.
      </p>
    </div>
  );
}

function Predict({
  state,
  onDone,
}: {
  state: RetrievalState;
  onDone: (reread: number, recall: number) => void;
}) {
  const n = state.rereadIds.length;
  const [reread, setReread] = useState(Math.round(n / 2));
  const [recall, setRecall] = useState(Math.round(n / 2));
  const byRound = practiceRecallByRound(state);
  return (
    <Stage label="Your prediction">
      <h2>How many will you remember on test day?</h2>
      <p>
        You reread {n} of the words three times. You tried to recall the other {n} three times (in
        round three you got {byRound[byRound.length - 1]?.pct ?? 0}% of those right). On test day
        you will be asked all {2 * n}, with no answers shown.
      </p>
      <PredictionSlider
        label={`Of the ${n} words you reread, how many will you get right?`}
        max={n}
        value={reread}
        onChange={setReread}
      />
      <PredictionSlider
        label={`Of the ${n} words you recalled, how many will you get right?`}
        max={n}
        value={recall}
        onChange={setRecall}
      />
      <button type="button" className="btn btn-lg" onClick={() => onDone(reread, recall)}>
        Lock it in
      </button>
    </Stage>
  );
}

function Immediate({
  state,
  onAnswer,
}: {
  state: RetrievalState;
  onAnswer: (typed: string) => void;
}) {
  const id = currentImmediateId(state);
  const pair = id ? pairById(id) : undefined;
  if (!pair) return null;
  return (
    <div className="stack">
      <Stage
        label="Five-minute test · eight extra words"
        count={`${state.immediateIndex + 1} of ${state.immediateOrder.length}`}
      >
        <div className="cue" lang="sw">
          {pair.cue}
        </div>
        <TypedAnswer
          prompt="What does it mean in English?"
          itemKey={`imm-${state.immediateIndex}`}
          onSubmit={onAnswer}
        />
      </Stage>
      <p className="small muted">
        No answers are shown in a test. Leave it blank if you do not know.
      </p>
    </div>
  );
}

const pct = (x: { correct: number; n: number }) =>
  x.n === 0 ? 0 : Math.round((100 * x.correct) / x.n);

function ImmediateCard({ state }: { state: RetrievalState }) {
  if (!state.immediate || state.immediateLog.length === 0) return null;
  const s = immediateScore(state);
  return (
    <section className="card stack">
      <h3>What the five-minute test said</h3>
      <div className="compare">
        <div className="compare-cell">
          <div className="label">Recalled words, right now</div>
          <div className="value">{pct(s.recall)}%</div>
          <div className="sub">
            {s.recall.correct} of {s.recall.n}
          </div>
        </div>
        <div className="compare-cell">
          <div className="label">Reread words, right now</div>
          <div className="value">{pct(s.reread)}%</div>
          <div className="sub">
            {s.reread.correct} of {s.reread.n}
          </div>
        </div>
      </div>
      <p className="small muted">
        Only eight words, so do not read too much into it. This is the kind of number that fools
        students: a check straight after studying usually makes rereading look as good or better.
        The test that matters comes after the gap.
      </p>
    </section>
  );
}

function FinalTest({
  state,
  onAnswer,
}: {
  state: RetrievalState;
  onAnswer: (typed: string) => void;
}) {
  const id = currentTestId(state);
  const pair = id ? pairById(id) : undefined;
  if (!pair) return null;
  return (
    <div className="stack">
      <Stage label="Memory test" count={`${state.testIndex + 1} of ${state.testOrder.length}`}>
        <div className="cue" lang="sw">
          {pair.cue}
        </div>
        <TypedAnswer
          prompt="What does it mean in English?"
          itemKey={`test-${state.testIndex}`}
          onSubmit={onAnswer}
        />
      </Stage>
      <progress
        className="progress"
        value={state.testIndex}
        max={state.testOrder.length}
        aria-label="Progress"
      />
      <p className="small muted">
        No answers are shown. If nothing comes, leave it blank and press Check.
      </p>
    </div>
  );
}

function Done({ run, state }: { run: Run; state: RetrievalState }) {
  const result = useMemo(() => run.result ?? computeResult(state), [run.result, state]);
  useEffect(() => {
    if (run.status !== 'complete') void finishRun(run, state, result);
  }, [run, state, result]);
  const p = PUBLISHED.retrieval;
  const imm = immediateScore(state);
  const hasImmediate = state.immediate && imm.recall.n > 0;
  const recallPct = result.conditions[0]?.scoredPct ?? 0;
  const rereadPct = result.conditions[1]?.scoredPct ?? 0;
  const days = state.testDay ?? state.delayDays;
  return (
    <div className="narrow stack-lg">
      <div className="page-head">
        <p className="kicker">Reread or recall</p>
        <h1>Your result</h1>
        <p className="lead">
          Recalled means the words you tried to remember three times. Reread means the words you saw
          three more times.
        </p>
      </div>
      <ResultSheet
        run={run}
        result={result}
        published={[
          {
            label: 'Roediger and Karpicke, 2006, test after 5 minutes',
            values: [`${p.fiveMinutes.recallPct}%`, `${p.fiveMinutes.rereadPct}%`],
          },
          {
            label: 'Roediger and Karpicke, 2006, test after 1 week',
            values: [`${p.oneWeek.recallPct}%`, `${p.oneWeek.rereadPct}%`],
          },
          {
            label: 'Karpicke and Roediger, 2008, Swahili pairs after 1 week',
            values: [`about ${p.keptTestingPct}%`, `about ${p.droppedTestingPct}%`],
          },
          {
            label: 'Karpicke and Roediger, 2008, what students predicted',
            values: [`about ${p.predictedPct}%`, `about ${p.predictedPct}%`],
          },
        ]}
        publishedNote="The 2006 numbers are from Experiment 2 (studying four times against studying once and recalling three times, prose passages). Note the order flips between five minutes and one week. Rowland's 2014 meta-analysis of 61 studies puts the testing effect at g = 0.41 for tests within a day and g = 0.69 for tests after a day."
        theory={
          <>
            <p>
              Rereading feels good because the words are right there: everything looks familiar, so
              you feel you know it. But familiarity while looking at the page is not the same as
              being able to bring the word back when the page is gone. In the exam hall there is no
              page.
            </p>
            <p>
              Recalling is the thing the test asks you to do. Each time you drag an answer out of
              memory, the path to it gets easier to find next time. Each time you fail and then see
              the answer, the gap gets patched. That is why it feels harder, and why it lasts.
            </p>
            <p>
              Straight after study, rereading can look as good or better, because the words are
              still fresh for everyone. The difference shows up after a night's sleep, which is why
              this test was {days} {days === 1 ? 'day' : 'days'} later.
            </p>
          </>
        }
      >
        {hasImmediate && (
          <section className="card stack">
            <h3>Right after study, and after the gap</h3>
            <PairedBars
              title="The five-minute test (eight extra words) and the delayed test (forty words)"
              groups={[
                {
                  label: 'After 5 minutes',
                  values: [
                    Math.round((100 * imm.recall.correct) / imm.recall.n),
                    Math.round((100 * imm.reread.correct) / Math.max(1, imm.reread.n)),
                  ],
                },
                {
                  label: `After ${days} ${days === 1 ? 'day' : 'days'}`,
                  values: [recallPct, rereadPct],
                },
              ]}
              series={['Recalled', 'Reread']}
            />
            <p className="small muted">
              The five-minute numbers are from only four words per condition, so they are rough. The
              point is the direction, not the size.
            </p>
          </section>
        )}
        <section className="card stack">
          <h3>What to do with this</h3>
          <p>
            When you revise, close the book and write down what you remember before you reread. Make
            flashcards and answer them by typing, not by flipping. The Flashcards page here does
            exactly that and brings each card back before you would forget it.
          </p>
        </section>
      </ResultSheet>
    </div>
  );
}
