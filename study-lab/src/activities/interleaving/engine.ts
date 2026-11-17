import { z } from 'zod';
import { PAINTERS, paintingSeed } from '../../content/painters.ts';
import type { Run, RunResult, TeacherSettings } from '../../data/schemas.ts';
import { Rng, shuffleNoRepeats } from '../../lib/rng.ts';
import { buildResult } from '../common.ts';

/**
 * Mixed or blocked. One sitting, about fifteen minutes.
 *
 * Kornell and Bjork (2008), as replicated by Yan, Bjork and Bjork (2016): twelve painters,
 * six paintings each, three seconds a painting. Half the painters are studied blocked (all six
 * paintings of one painter together) and half interleaved (the paintings mixed up). Then a
 * short break, then new paintings to name. Here the two schedules run as two separate phases
 * with two frame colours, because Yan and colleagues (Experiment 6) found students only
 * believed the result when the two conditions were easy to tell apart.
 */

export const STUDY_PER_PAINTER = 6;
export const TEST_PER_PAINTER = 2;

const StudyItem = z.object({ painterId: z.string(), seed: z.number() });
const TestItem = z.object({
  painterId: z.string(),
  seed: z.number(),
  condition: z.enum(['blocked', 'interleaved']),
});

export const InterleavingStateSchema = z.object({
  phase: z.enum(['study', 'rate', 'filler', 'test', 'done']),
  secondsPerPainting: z.number(),
  fillerSeconds: z.number(),
  blockedIds: z.array(z.string()),
  interleavedIds: z.array(z.string()),
  phaseOrder: z.array(z.enum(['blocked', 'interleaved'])).length(2),
  study: z.object({ blocked: z.array(StudyItem), interleaved: z.array(StudyItem) }),
  test: z.array(TestItem),
  phaseIndex: z.number().int().min(0).max(1),
  studyIndex: z.number().int().min(0),
  testIndex: z.number().int().min(0),
  predictions: z.object({ blocked: z.number().nullable(), interleaved: z.number().nullable() }),
  answers: z.array(z.string().nullable()),
});
export type InterleavingState = z.infer<typeof InterleavingStateSchema>;
export type Condition = 'blocked' | 'interleaved';

export function createPlan(seed: number, teacher: TeacherSettings): InterleavingState {
  const rng = new Rng(seed);
  const count = teacher.artistCount - (teacher.artistCount % 2);
  const chosen = rng.shuffle(PAINTERS).slice(0, count);
  const half = count / 2;
  const blockedIds = chosen.slice(0, half).map((p) => p.id);
  const interleavedIds = chosen.slice(half).map((p) => p.id);

  const blockedStudy = rng.shuffle(blockedIds).flatMap((id) =>
    Array.from({ length: STUDY_PER_PAINTER }, (_, i) => ({
      painterId: id,
      seed: paintingSeed(seed, id, i),
    })),
  );
  const interleavedItems = interleavedIds.flatMap((id) =>
    Array.from({ length: STUDY_PER_PAINTER }, (_, i) => ({
      painterId: id,
      seed: paintingSeed(seed, id, i),
    })),
  );
  const interleavedStudy = shuffleNoRepeats(rng.fork(), interleavedItems, (x) => x.painterId);

  const testItems = [...blockedIds, ...interleavedIds].flatMap((id) =>
    Array.from({ length: TEST_PER_PAINTER }, (_, i) => ({
      painterId: id,
      seed: paintingSeed(seed, id, STUDY_PER_PAINTER + i),
      condition: (blockedIds.includes(id) ? 'blocked' : 'interleaved') as Condition,
    })),
  );
  const test = shuffleNoRepeats(rng.fork(), testItems, (x) => x.painterId);
  const phaseOrder: Condition[] =
    rng.next() < 0.5 ? ['blocked', 'interleaved'] : ['interleaved', 'blocked'];

  return {
    phase: 'study',
    secondsPerPainting: teacher.secondsPerPainting,
    fillerSeconds: teacher.fillerSeconds,
    blockedIds,
    interleavedIds,
    phaseOrder,
    study: { blocked: blockedStudy, interleaved: interleavedStudy },
    test,
    phaseIndex: 0,
    studyIndex: 0,
    testIndex: 0,
    predictions: { blocked: null, interleaved: null },
    answers: [],
  };
}

export function currentCondition(state: InterleavingState): Condition {
  return state.phaseOrder[state.phaseIndex] ?? 'blocked';
}

export function currentStudyItem(state: InterleavingState) {
  return state.study[currentCondition(state)][state.studyIndex];
}

/** Moves to the next painting, or to the rating screen at the end of a phase. */
export function advanceStudy(state: InterleavingState): InterleavingState {
  const list = state.study[currentCondition(state)];
  if (state.studyIndex + 1 < list.length) return { ...state, studyIndex: state.studyIndex + 1 };
  return { ...state, phase: 'rate' };
}

export function setPrediction(state: InterleavingState, value: number): InterleavingState {
  const cond = currentCondition(state);
  const predictions = { ...state.predictions, [cond]: value };
  if (state.phaseIndex === 0) {
    return { ...state, predictions, phase: 'study', phaseIndex: 1, studyIndex: 0 };
  }
  return { ...state, predictions, phase: 'filler' };
}

export function startTest(state: InterleavingState): InterleavingState {
  return { ...state, phase: 'test', testIndex: 0 };
}

export function answerTest(state: InterleavingState, painterId: string | null): InterleavingState {
  const answers = [...state.answers, painterId];
  const next = state.testIndex + 1;
  if (next >= state.test.length) return { ...state, answers, phase: 'done' };
  return { ...state, answers, testIndex: next };
}

export function testCountFor(state: InterleavingState, cond: Condition): number {
  return state.test.filter((t) => t.condition === cond).length;
}

export function score(state: InterleavingState): Record<Condition, { correct: number; n: number }> {
  const out = { blocked: { correct: 0, n: 0 }, interleaved: { correct: 0, n: 0 } };
  state.test.forEach((item, i) => {
    const bucket = out[item.condition];
    bucket.n++;
    if (state.answers[i] === item.painterId) bucket.correct++;
  });
  return out;
}

export function computeResult(state: InterleavingState): RunResult {
  const s = score(state);
  return buildResult(
    {
      key: 'interleaved',
      label: 'Mixed',
      correct: s.interleaved.correct,
      n: s.interleaved.n,
      predicted: state.predictions.interleaved,
    },
    {
      key: 'blocked',
      label: 'Blocked',
      correct: s.blocked.correct,
      n: s.blocked.n,
      predicted: state.predictions.blocked,
    },
  );
}

/** The painters whose names appear on the answer panel, in a fixed alphabetical order. */
export function panelPainters(state: InterleavingState) {
  const ids = new Set([...state.blockedIds, ...state.interleavedIds]);
  return PAINTERS.filter((p) => ids.has(p.id));
}

export function parseState(run: Run): InterleavingState | null {
  const parsed = InterleavingStateSchema.safeParse(run.state);
  return parsed.success ? parsed.data : null;
}

export function describeNext(run: Run): { label: string; ready: boolean } {
  const state = parseState(run);
  if (!state) return { label: 'This run cannot be read.', ready: false };
  switch (state.phase) {
    case 'study':
      return { label: 'Studying the paintings', ready: true };
    case 'rate':
      return { label: 'Waiting for your prediction', ready: true };
    case 'filler':
      return { label: 'Short break, then the test', ready: true };
    case 'test':
      return { label: 'Naming new paintings', ready: true };
    case 'done':
      return { label: 'Your results are ready', ready: true };
  }
}
