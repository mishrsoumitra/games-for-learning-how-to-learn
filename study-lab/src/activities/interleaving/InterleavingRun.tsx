import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router';
import { PUBLISHED } from '../../content/research.ts';
import { paintingFor, painterById } from '../../content/painters.ts';
import type { Run } from '../../data/schemas.ts';
import { FillerGame } from '../../components/FillerGame.tsx';
import { PaintingView } from '../../components/PaintingView.tsx';
import { PredictionSlider } from '../../components/PredictionSlider.tsx';
import { ResultSheet } from '../../components/ResultSheet.tsx';
import { RunGuard } from '../../components/RunGuard.tsx';
import { Stage } from '../../components/Stage.tsx';
import { useCountdown } from '../../components/useTicker.ts';
import { finishRun, saveRunState } from '../common.ts';
import {
  advanceStudy,
  answerTest,
  computeResult,
  currentCondition,
  currentStudyItem,
  panelPainters,
  parseState,
  setPrediction,
  startTest,
  testCountFor,
  type Condition,
  type InterleavingState,
} from './engine.ts';

const CONDITION_LABEL: Record<Condition, string> = {
  blocked: 'One painter at a time',
  interleaved: 'Painters mixed up',
};

export default function InterleavingRun() {
  return (
    <RunGuard activity="interleaving" parse={parseState}>
      {(run, state) => <Screen run={run} state={state} />}
    </RunGuard>
  );
}

function Screen({ run, state }: { run: Run; state: InterleavingState }) {
  const save = useCallback((next: InterleavingState) => void saveRunState(run, next), [run]);

  switch (state.phase) {
    case 'study':
      return <Study state={state} onAdvance={() => save(advanceStudy(state))} />;
    case 'rate':
      return <Rate state={state} onDone={(v) => save(setPrediction(state, v))} />;
    case 'filler':
      return (
        <Stage label="Break">
          <FillerGame
            seconds={state.fillerSeconds}
            seed={run.seed}
            onDone={() => save(startTest(state))}
          />
        </Stage>
      );
    case 'test':
      return (
        <Test key={state.testIndex} state={state} onAnswer={(id) => save(answerTest(state, id))} />
      );
    case 'done':
      return <Done run={run} state={state} />;
  }
}

function Study({ state, onAdvance }: { state: InterleavingState; onAdvance: () => void }) {
  const item = currentStudyItem(state);
  const cond = currentCondition(state);
  const list = state.study[cond];
  const key = `${state.phaseIndex}-${state.studyIndex}`;
  useCountdown(state.secondsPerPainting, onAdvance, key);
  const painting = useMemo(
    () => (item ? paintingFor(painterById(item.painterId), item.seed) : null),
    [item],
  );
  if (!item || !painting) return null;
  const painter = painterById(item.painterId);
  return (
    <div className="stack">
      <Stage
        frame={cond === 'blocked' ? 'a' : 'b'}
        label={`Phase ${state.phaseIndex + 1} · ${CONDITION_LABEL[cond]}`}
        count={`${state.studyIndex + 1} of ${list.length}`}
      >
        <PaintingView painting={painting} title={`A painting by ${painter.name}`} />
        <div className="painting-name">{painter.name}</div>
      </Stage>
      <progress
        className="progress"
        value={state.studyIndex + 1}
        max={list.length}
        aria-label="Progress through this phase"
      />
      <p className="small muted">
        Watch the painting and read the name. The next one comes by itself.
      </p>
    </div>
  );
}

function Rate({ state, onDone }: { state: InterleavingState; onDone: (value: number) => void }) {
  const cond = currentCondition(state);
  const n = testCountFor(state, cond);
  const [value, setValue] = useState(Math.round(n / 2));
  const painters = (cond === 'blocked' ? state.blockedIds : state.interleavedIds).map(
    (id) => painterById(id).name,
  );
  return (
    <Stage
      frame={cond === 'blocked' ? 'a' : 'b'}
      label={`Phase ${state.phaseIndex + 1} · ${CONDITION_LABEL[cond]}`}
    >
      <h2>How well do you know these {painters.length} painters?</h2>
      <p>
        {painters.join(', ')}. In the test you will see {n} new paintings by them, with no names.
        How many will you name right?
      </p>
      <PredictionSlider label="Your prediction" max={n} value={value} onChange={setValue} />
      <button type="button" className="btn btn-lg" onClick={() => onDone(value)}>
        {state.phaseIndex === 0 ? 'Lock it in and start phase 2' : 'Lock it in'}
      </button>
    </Stage>
  );
}

function Test({ state, onAnswer }: { state: InterleavingState; onAnswer: (id: string) => void }) {
  const item = state.test[state.testIndex];
  const painting = useMemo(
    () => (item ? paintingFor(painterById(item.painterId), item.seed) : null),
    [item],
  );
  const panel = useMemo(() => panelPainters(state), [state]);
  const [picked, setPicked] = useState<string | null>(null);
  if (!item || !painting) return null;
  return (
    <div className="stack">
      <Stage
        label="Test · who painted this?"
        count={`${state.testIndex + 1} of ${state.test.length}`}
      >
        <PaintingView painting={painting} title="A painting to name" />
        <div className="choices" role="group" aria-label="Painters">
          {panel.map((p) => (
            <button
              key={p.id}
              type="button"
              className="choice"
              aria-pressed={picked === p.id}
              onClick={() => setPicked(p.id)}
            >
              {p.name}
            </button>
          ))}
        </div>
        <button
          type="button"
          className="btn"
          disabled={picked === null}
          onClick={() => {
            if (picked !== null) onAnswer(picked);
          }}
        >
          Next painting
        </button>
      </Stage>
      <progress
        className="progress"
        value={state.testIndex}
        max={state.test.length}
        aria-label="Progress through the test"
      />
    </div>
  );
}

function Done({ run, state }: { run: Run; state: InterleavingState }) {
  const result = useMemo(() => run.result ?? computeResult(state), [run.result, state]);
  useEffect(() => {
    if (run.status !== 'complete') void finishRun(run, state, result);
  }, [run, state, result]);
  const p = PUBLISHED.interleaving;
  return (
    <div className="narrow stack-lg">
      <div className="page-head">
        <p className="kicker">Mixed or blocked</p>
        <h1>Your result</h1>
        <p className="lead">
          Mixed means the painters you studied mixed up. Blocked means the painters you studied one
          at a time.
        </p>
      </div>
      <ResultSheet
        run={run}
        result={result}
        published={[
          {
            label: 'Yan, Bjork and Bjork, 2016 (Exp. 1A, 72 paintings)',
            values: [`${p.interleavedPct}%`, `${p.blockedPct}%`],
          },
          {
            label: 'Kornell and Bjork, 2008: share of students who did better with',
            values: [
              `${p.didBetterWithInterleavingPct}%`,
              `${100 - p.didBetterWithInterleavingPct}%`,
            ],
          },
          {
            label: 'Kornell and Bjork, 2008: share who rated this way as good or better',
            values: [
              `${100 - p.ratedBlockingAsGoodOrBetterPct}%`,
              `${p.ratedBlockingAsGoodOrBetterPct}%`,
            ],
          },
        ]}
        publishedNote="In Kornell and Bjork (2008), 78% of students scored higher on the mixed painters, and 78% said blocking had worked as well or better. The two groups overlap: most students got it backwards."
        theory={
          <>
            <p>
              When six paintings by one painter come one after another, you never have to ask "which
              painter is this?" The name is on the screen, and the last five were by the same
              person. It feels smooth, and it feels like learning.
            </p>
            <p>
              When the painters are mixed, every new painting makes you compare: how is this one
              different from the one before? That comparing is exactly what you need in the test,
              when a new painting arrives with no name on it. Mixing feels worse while you study
              because it makes you do that work, and it works better for the same reason.
            </p>
            <p>
              The same thing happens in an exam. Your tutorial sheet had ten problems from one
              chapter in a row, so you never had to decide which method to use. In the exam the
              problems are mixed and there is no label for which chapter they're from. If you only
              ever practised blocked, that decision is the step you never practised.
            </p>
          </>
        }
      >
        <section className="card stack">
          <h3>What to do with this</h3>
          <p>
            When you revise, mix problems from different chapters in one sitting, and let it feel
            harder. The feeling is not telling you how much you learned. Go to the{' '}
            <Link to="/guide">guide</Link> for the paper and the caveats, including when mixing does
            not help.
          </p>
        </section>
      </ResultSheet>
    </div>
  );
}
