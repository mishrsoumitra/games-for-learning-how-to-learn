import { z } from 'zod';
import { RETRIEVAL_IMMEDIATE_SET, RETRIEVAL_SET, pairById } from '../../content/swahili.ts';
import type { Run, RunResult, TeacherSettings } from '../../data/schemas.ts';
import { dayIndex } from '../../lib/dates.ts';
import { Rng } from '../../lib/rng.ts';
import { answerMatches } from '../../lib/text.ts';
import { buildResult } from '../common.ts';

/**
 * Reread or recall. Day 0 is about twenty minutes; the test comes two days later.
 *
 * Karpicke and Roediger (2008) taught Swahili–English pairs and found that pairs kept in
 * testing were remembered far better a week later than pairs only restudied, while students
 * predicted the same for both. Roediger and Karpicke (2006) showed the catch: five minutes
 * after study, rereading looks better. Here every student studies all pairs once, then half
 * the pairs are reread three times and half are recalled three times with the answer shown
 * after each try. The optional immediate test uses eight extra pairs, so the main forty are
 * not tested until the delay is up.
 */

export const ROUNDS = 3;
export const FEEDBACK_SECONDS = 2;

export type Condition = 'reread' | 'recall';

const Round = z.object({
  order: z.array(z.enum(['reread', 'recall'])).length(2),
  reread: z.array(z.string()),
  recall: z.array(z.string()),
});

const Attempt = z.object({ id: z.string(), typed: z.string(), correct: z.boolean() });

export const RetrievalStateSchema = z.object({
  phase: z.enum([
    'study',
    'practice',
    'predict',
    'immediate',
    'waiting',
    'test',
    'honesty',
    'done',
  ]),
  secondsPerPair: z.number(),
  delayDays: z.number().int(),
  immediate: z.boolean(),
  rereadIds: z.array(z.string()),
  recallIds: z.array(z.string()),
  extraReread: z.array(z.string()),
  extraRecall: z.array(z.string()),
  studyOrder: z.array(z.string()),
  studyIndex: z.number().int().min(0),
  rounds: z.array(Round),
  roundIndex: z.number().int().min(0),
  blockIndex: z.number().int().min(0).max(1),
  itemIndex: z.number().int().min(0),
  practiceLog: z.array(Attempt.extend({ round: z.number().int() })),
  predictions: z.object({ reread: z.number().nullable(), recall: z.number().nullable() }),
  immediateOrder: z.array(z.string()),
  immediateIndex: z.number().int().min(0),
  immediateLog: z.array(Attempt),
  testOrder: z.array(z.string()),
  testIndex: z.number().int().min(0),
  testLog: z.array(Attempt),
  testDay: z.number().int().nullable(),
  honesty: z.enum(['clean', 'peeked', 'unsure']).nullable(),
});
export type RetrievalState = z.infer<typeof RetrievalStateSchema>;

export function createPlan(
  seed: number,
  teacher: TeacherSettings,
  immediate: boolean,
): RetrievalState {
  const rng = new Rng(seed);
  const main = rng.shuffle(RETRIEVAL_SET.map((p) => p.id));
  const half = main.length / 2;
  const rereadIds = main.slice(0, half);
  const recallIds = main.slice(half);
  const extra = immediate ? rng.shuffle(RETRIEVAL_IMMEDIATE_SET.map((p) => p.id)) : [];
  const extraReread = extra.slice(0, extra.length / 2);
  const extraRecall = extra.slice(extra.length / 2);

  const rounds = Array.from({ length: ROUNDS }, (_, i) => ({
    order: (i % 2 === 0 ? ['reread', 'recall'] : ['recall', 'reread']) as Condition[],
    reread: rng.shuffle([...rereadIds, ...extraReread]),
    recall: rng.shuffle([...recallIds, ...extraRecall]),
  }));
  // Which block comes first in round one is decided by the seed, so it varies across students.
  if (rng.next() < 0.5)
    for (const r of rounds) r.order = [r.order[1] as Condition, r.order[0] as Condition];

  return {
    phase: 'study',
    secondsPerPair: teacher.secondsPerPair,
    delayDays: teacher.retrievalDelayDays,
    immediate,
    rereadIds,
    recallIds,
    extraReread,
    extraRecall,
    studyOrder: rng.shuffle([...main, ...extra]),
    studyIndex: 0,
    rounds,
    roundIndex: 0,
    blockIndex: 0,
    itemIndex: 0,
    practiceLog: [],
    predictions: { reread: null, recall: null },
    immediateOrder: rng.shuffle(extra),
    immediateIndex: 0,
    immediateLog: [],
    testOrder: rng.shuffle(main),
    testIndex: 0,
    testLog: [],
    testDay: null,
    honesty: null,
  };
}

export function advanceStudy(state: RetrievalState): RetrievalState {
  if (state.studyIndex + 1 < state.studyOrder.length)
    return { ...state, studyIndex: state.studyIndex + 1 };
  return { ...state, phase: 'practice', roundIndex: 0, blockIndex: 0, itemIndex: 0 };
}

export function currentRound(state: RetrievalState) {
  return state.rounds[state.roundIndex];
}

export function currentBlockCondition(state: RetrievalState): Condition {
  return currentRound(state)?.order[state.blockIndex] ?? 'reread';
}

export function currentPracticeId(state: RetrievalState): string | undefined {
  const round = currentRound(state);
  if (!round) return undefined;
  return round[currentBlockCondition(state)][state.itemIndex];
}

function stepPractice(state: RetrievalState): RetrievalState {
  const round = currentRound(state);
  if (!round) return { ...state, phase: 'predict' };
  const list = round[currentBlockCondition(state)];
  if (state.itemIndex + 1 < list.length) return { ...state, itemIndex: state.itemIndex + 1 };
  if (state.blockIndex === 0) return { ...state, blockIndex: 1, itemIndex: 0 };
  if (state.roundIndex + 1 < state.rounds.length) {
    return { ...state, roundIndex: state.roundIndex + 1, blockIndex: 0, itemIndex: 0 };
  }
  return { ...state, phase: 'predict' };
}

/** A reread item has been shown for its time. */
export function advanceReread(state: RetrievalState): RetrievalState {
  return stepPractice(state);
}

/** A recall attempt was typed. The caller shows feedback, then calls advance. */
export function recordRecall(
  state: RetrievalState,
  typed: string,
): RetrievalState & { lastCorrect: boolean } {
  const id = currentPracticeId(state);
  const pair = id ? pairById(id) : undefined;
  const correct = pair ? answerMatches(typed, pair.accept) : false;
  const practiceLog = id
    ? [...state.practiceLog, { round: state.roundIndex, id, typed: typed.slice(0, 80), correct }]
    : state.practiceLog;
  return { ...state, practiceLog, lastCorrect: correct };
}

export function afterRecallFeedback(state: RetrievalState): RetrievalState {
  return stepPractice(state);
}

export function setPredictions(
  state: RetrievalState,
  reread: number,
  recall: number,
): RetrievalState {
  const predictions = { reread, recall };
  if (state.immediate && state.immediateOrder.length > 0) {
    return { ...state, predictions, phase: 'immediate', immediateIndex: 0 };
  }
  return { ...state, predictions, phase: 'waiting' };
}

export function currentImmediateId(state: RetrievalState): string | undefined {
  return state.immediateOrder[state.immediateIndex];
}

export function recordImmediate(state: RetrievalState, typed: string): RetrievalState {
  const id = currentImmediateId(state);
  const pair = id ? pairById(id) : undefined;
  const correct = pair ? answerMatches(typed, pair.accept) : false;
  const immediateLog = id
    ? [...state.immediateLog, { id, typed: typed.slice(0, 80), correct }]
    : state.immediateLog;
  const next = state.immediateIndex + 1;
  if (next >= state.immediateOrder.length) return { ...state, immediateLog, phase: 'waiting' };
  return { ...state, immediateLog, immediateIndex: next };
}

export function immediateScore(
  state: RetrievalState,
): Record<Condition, { correct: number; n: number }> {
  const out = { reread: { correct: 0, n: 0 }, recall: { correct: 0, n: 0 } };
  for (const a of state.immediateLog) {
    const cond: Condition = state.extraReread.includes(a.id) ? 'reread' : 'recall';
    out[cond].n++;
    if (a.correct) out[cond].correct++;
  }
  return out;
}

export function practiceRecallByRound(state: RetrievalState): { round: number; pct: number }[] {
  return Array.from({ length: state.rounds.length }, (_, r) => {
    const attempts = state.practiceLog.filter((a) => a.round === r);
    const correct = attempts.filter((a) => a.correct).length;
    return {
      round: r + 1,
      pct: attempts.length === 0 ? 0 : Math.round((100 * correct) / attempts.length),
    };
  });
}

export interface Unlock {
  ready: boolean;
  today: number;
  dueDay: number;
  late: boolean;
}

export function testUnlock(
  run: Run,
  state: RetrievalState,
  teacher: TeacherSettings,
  now = new Date(),
): Unlock {
  const today = dayIndex(run.startedAt, now);
  const dueDay = state.delayDays;
  return { ready: teacher.allowEarlyTests || today >= dueDay, today, dueDay, late: today > dueDay };
}

export function startTest(state: RetrievalState, today: number): RetrievalState {
  return { ...state, phase: 'test', testIndex: 0, testDay: today };
}

export function currentTestId(state: RetrievalState): string | undefined {
  return state.testOrder[state.testIndex];
}

export function recordTest(state: RetrievalState, typed: string): RetrievalState {
  const id = currentTestId(state);
  const pair = id ? pairById(id) : undefined;
  const correct = pair ? answerMatches(typed, pair.accept) : false;
  const testLog = id
    ? [...state.testLog, { id, typed: typed.slice(0, 80), correct }]
    : state.testLog;
  const next = state.testIndex + 1;
  if (next >= state.testOrder.length) return { ...state, testLog, phase: 'honesty' };
  return { ...state, testLog, testIndex: next };
}

export function setHonesty(
  state: RetrievalState,
  honesty: 'clean' | 'peeked' | 'unsure',
): RetrievalState {
  return { ...state, honesty, phase: 'done' };
}

export function testScore(
  state: RetrievalState,
): Record<Condition, { correct: number; n: number }> {
  const out = { reread: { correct: 0, n: 0 }, recall: { correct: 0, n: 0 } };
  for (const a of state.testLog) {
    const cond: Condition = state.rereadIds.includes(a.id) ? 'reread' : 'recall';
    out[cond].n++;
    if (a.correct) out[cond].correct++;
  }
  return out;
}

export function computeResult(state: RetrievalState): RunResult {
  const s = testScore(state);
  const imm = immediateScore(state);
  const extras: Record<string, number> = {};
  if (state.immediate && imm.reread.n > 0) {
    extras['immediateRereadPct'] = Math.round((100 * imm.reread.correct) / imm.reread.n);
    extras['immediateRecallPct'] = Math.round((100 * imm.recall.correct) / imm.recall.n);
  }
  const byRound = practiceRecallByRound(state);
  for (const r of byRound) extras[`practiceRecallRound${r.round}Pct`] = r.pct;
  if (state.testDay !== null) extras['testDay'] = state.testDay;
  return buildResult(
    {
      key: 'recall',
      label: 'Recalled',
      correct: s.recall.correct,
      n: s.recall.n,
      predicted: state.predictions.recall,
      predictedOf: state.recallIds.length,
    },
    {
      key: 'reread',
      label: 'Reread',
      correct: s.reread.correct,
      n: s.reread.n,
      predicted: state.predictions.reread,
      predictedOf: state.rereadIds.length,
    },
    { honesty: state.honesty ?? 'clean', extras },
  );
}

export function parseState(run: Run): RetrievalState | null {
  const parsed = RetrievalStateSchema.safeParse(run.state);
  return parsed.success ? parsed.data : null;
}

export function describeNext(
  run: Run,
  teacher: TeacherSettings,
  now = new Date(),
): { label: string; ready: boolean } {
  const state = parseState(run);
  if (!state) return { label: 'This run cannot be read.', ready: false };
  switch (state.phase) {
    case 'study':
      return { label: 'Studying the word pairs', ready: true };
    case 'practice':
      return {
        label: `Practice round ${state.roundIndex + 1} of ${state.rounds.length}`,
        ready: true,
      };
    case 'predict':
      return { label: 'Waiting for your predictions', ready: true };
    case 'immediate':
      return { label: 'The five-minute test', ready: true };
    case 'waiting': {
      const u = testUnlock(run, state, teacher, now);
      if (u.ready) return { label: 'The memory test is open', ready: true };
      const days = u.dueDay - u.today;
      return { label: `Memory test in ${days} ${days === 1 ? 'day' : 'days'}`, ready: false };
    }
    case 'test':
      return { label: 'Memory test in progress', ready: true };
    case 'honesty':
      return { label: 'One last question', ready: true };
    case 'done':
      return { label: 'Your results are ready', ready: true };
  }
}
