import { z } from 'zod';
import { CRAMMED_SET, CURVE_SET, SPACED_SET, pairById } from '../../content/swahili.ts';
import type { Run, RunResult, TeacherSettings } from '../../data/schemas.ts';
import { dayIndex, minutesBetween, nowIso } from '../../lib/dates.ts';
import { Rng } from '../../lib/rng.ts';
import { answerMatches } from '../../lib/text.ts';
import { buildResult } from '../common.ts';

/**
 * Cram or space. Short sessions on several days, a test on day 5, and an optional
 * forgetting curve that runs to day 7.
 *
 * Kornell (2009): the same flashcards learned in one big stack across days beat four small
 * stacks crammed, for 90% of students, while 72% believed cramming had worked better right
 * after the first session. Here one set of twenty pairs gets one pass on each of days 0, 1,
 * 2 and 3; a second set gets four passes in a row on day 3. Same number of passes, different
 * schedule. A pass is cue, type, answer shown. A third set, learned on day 0, is tested in
 * fifths at 10 minutes, 1 day, 2 days, 4 days and 7 days to draw the student's own
 * forgetting curve (after Ebbinghaus, with the schedule from the research notes).
 */

export type SetId = 'spaced' | 'crammed' | 'curve';
export const CURVE_POINTS = ['10 minutes', '1 day', '2 days', '4 days', '7 days'] as const;
export const CURVE_WAIT_MINUTES = 10;

const Task = z.discriminatedUnion('kind', [
  z.object({ kind: z.literal('learn-curve') }),
  z.object({
    kind: z.literal('pass'),
    set: z.enum(['spaced', 'crammed']),
    passes: z.number().int().min(1),
  }),
  z.object({ kind: z.literal('rate'), set: z.enum(['spaced', 'crammed']) }),
  z.object({ kind: z.literal('curve-test'), fifth: z.number().int().min(0).max(4) }),
  z.object({ kind: z.literal('final-predict') }),
  z.object({ kind: z.literal('final-test') }),
  z.object({ kind: z.literal('honesty') }),
]);
export type Task = z.infer<typeof Task>;

const Session = z.object({
  day: z.number().int().min(0),
  tasks: z.array(Task),
  doneAt: z.string().optional(),
  actualDay: z.number().int().optional(),
});
export type Session = z.infer<typeof Session>;

const Attempt = z.object({
  day: z.number().int(),
  set: z.enum(['spaced', 'crammed', 'curve']),
  pass: z.number().int(),
  id: z.string(),
  typed: z.string(),
  correct: z.boolean(),
});

export const SpacingStateSchema = z.object({
  phase: z.enum(['session', 'waiting', 'done']),
  testDay: z.number().int(),
  curve: z.boolean(),
  secondsPerPair: z.number(),
  spacedIds: z.array(z.string()),
  crammedIds: z.array(z.string()),
  curveIds: z.array(z.string()),
  curveFifths: z.array(z.array(z.string())),
  sessions: z.array(Session),
  sessionIndex: z.number().int().min(0),
  taskIndex: z.number().int().min(0),
  passIndex: z.number().int().min(0),
  itemIndex: z.number().int().min(0),
  order: z.array(z.string()),
  learnCurveAt: z.string().nullable(),
  log: z.array(Attempt),
  ratings: z.array(
    z.object({ day: z.number().int(), set: z.enum(['spaced', 'crammed']), value: z.number() }),
  ),
  curveResults: z.array(
    z.object({
      fifth: z.number().int(),
      day: z.number().int(),
      correct: z.number().int(),
      n: z.number().int(),
    }),
  ),
  predictions: z.object({ spaced: z.number().nullable(), crammed: z.number().nullable() }),
  finalLog: z.array(z.object({ id: z.string(), typed: z.string(), correct: z.boolean() })),
  honesty: z.enum(['clean', 'peeked', 'unsure']).nullable(),
  offSchedule: z.boolean(),
});
export type SpacingState = z.infer<typeof SpacingStateSchema>;

export function buildSessions(testDay: number, curve: boolean): Session[] {
  const sessions: Session[] = [
    {
      day: 0,
      tasks: [
        ...(curve ? [{ kind: 'learn-curve' } as Task] : []),
        { kind: 'pass', set: 'spaced', passes: 1 },
        { kind: 'rate', set: 'spaced' },
        ...(curve ? [{ kind: 'curve-test', fifth: 0 } as Task] : []),
      ],
    },
    {
      day: 1,
      tasks: [
        { kind: 'pass', set: 'spaced', passes: 1 },
        { kind: 'rate', set: 'spaced' },
        ...(curve ? [{ kind: 'curve-test', fifth: 1 } as Task] : []),
      ],
    },
    {
      day: 2,
      tasks: [
        { kind: 'pass', set: 'spaced', passes: 1 },
        { kind: 'rate', set: 'spaced' },
        ...(curve ? [{ kind: 'curve-test', fifth: 2 } as Task] : []),
      ],
    },
    {
      day: 3,
      tasks: [
        { kind: 'pass', set: 'spaced', passes: 1 },
        { kind: 'rate', set: 'spaced' },
        { kind: 'pass', set: 'crammed', passes: 4 },
        { kind: 'rate', set: 'crammed' },
      ],
    },
  ];
  if (curve) sessions.push({ day: 4, tasks: [{ kind: 'curve-test', fifth: 3 }] });
  sessions.push({
    day: testDay,
    tasks: [{ kind: 'final-predict' }, { kind: 'final-test' }, { kind: 'honesty' }],
  });
  if (curve) sessions.push({ day: 7, tasks: [{ kind: 'curve-test', fifth: 4 }] });
  return sessions.sort((a, b) => a.day - b.day);
}

export function createPlan(
  seed: number,
  teacher: TeacherSettings,
  curve = teacher.forgettingCurve,
): SpacingState {
  const rng = new Rng(seed);
  const curveIds = rng.shuffle(CURVE_SET.map((p) => p.id));
  const curveFifths = Array.from({ length: 5 }, (_, i) => curveIds.slice(i * 4, i * 4 + 4));
  return {
    phase: 'session',
    testDay: teacher.spacingTestDay,
    curve,
    secondsPerPair: teacher.secondsPerPair,
    spacedIds: rng.shuffle(SPACED_SET.map((p) => p.id)),
    crammedIds: rng.shuffle(CRAMMED_SET.map((p) => p.id)),
    curveIds,
    curveFifths,
    sessions: buildSessions(teacher.spacingTestDay, curve),
    sessionIndex: 0,
    taskIndex: 0,
    passIndex: 0,
    itemIndex: 0,
    order: [],
    learnCurveAt: null,
    log: [],
    ratings: [],
    curveResults: [],
    predictions: { spaced: null, crammed: null },
    finalLog: [],
    honesty: null,
    offSchedule: false,
  };
}

/** The student has opened today's session. */
export function startSession(state: SpacingState): SpacingState {
  if (state.phase !== 'waiting') return state;
  return { ...state, phase: 'session', taskIndex: 0, itemIndex: 0, passIndex: 0, order: [] };
}

export function currentSession(state: SpacingState): Session | undefined {
  return state.sessions[state.sessionIndex];
}

export function currentTask(state: SpacingState): Task | undefined {
  return currentSession(state)?.tasks[state.taskIndex];
}

export function idsFor(state: SpacingState, set: SetId): string[] {
  return set === 'spaced' ? state.spacedIds : set === 'crammed' ? state.crammedIds : state.curveIds;
}

export interface SessionGate {
  ready: boolean;
  today: number;
  dueDay: number;
  late: boolean;
  /** For the ten-minute curve test: minutes still to wait, or 0. */
  waitMinutes: number;
}

export function sessionGate(
  run: Run,
  state: SpacingState,
  teacher: TeacherSettings,
  now = new Date(),
): SessionGate {
  const session = currentSession(state);
  const today = dayIndex(run.startedAt, now);
  if (!session) return { ready: false, today, dueDay: 0, late: false, waitMinutes: 0 };
  const task = currentTask(state);
  let waitMinutes = 0;
  if (task?.kind === 'curve-test' && task.fifth === 0 && state.learnCurveAt) {
    const passed = minutesBetween(state.learnCurveAt, now.toISOString());
    waitMinutes = Math.max(0, Math.ceil(CURVE_WAIT_MINUTES - passed));
    if (teacher.allowEarlyTests) waitMinutes = 0;
  }
  const dayReady = teacher.allowEarlyTests || today >= session.day;
  return {
    ready: dayReady && waitMinutes === 0,
    today,
    dueDay: session.day,
    late: today > session.day,
    waitMinutes,
  };
}

/** Starts a task's item list in a fresh shuffled order. */
export function beginTask(state: SpacingState, rngSeed: number): SpacingState {
  const task = currentTask(state);
  const rng = new Rng(rngSeed);
  if (!task) return state;
  switch (task.kind) {
    case 'learn-curve':
      return { ...state, order: rng.shuffle(state.curveIds), itemIndex: 0, passIndex: 0 };
    case 'pass':
      return { ...state, order: rng.shuffle(idsFor(state, task.set)), itemIndex: 0, passIndex: 0 };
    case 'curve-test':
      return {
        ...state,
        order: rng.shuffle(state.curveFifths[task.fifth] ?? []),
        itemIndex: 0,
        passIndex: 0,
      };
    case 'final-test':
      return {
        ...state,
        order: rng.shuffle([...state.spacedIds, ...state.crammedIds]),
        itemIndex: 0,
        passIndex: 0,
      };
    default:
      return { ...state, order: [], itemIndex: 0, passIndex: 0 };
  }
}

function finishTask(state: SpacingState, today: number): SpacingState {
  const session = currentSession(state);
  if (!session) return state;
  if (state.taskIndex + 1 < session.tasks.length) {
    return { ...state, taskIndex: state.taskIndex + 1, itemIndex: 0, passIndex: 0, order: [] };
  }
  // Session finished. If it ran late, push every later session back by the same amount.
  const lateBy = Math.max(0, today - session.day);
  const sessions = state.sessions.map((s, i) => {
    if (i === state.sessionIndex) return { ...s, doneAt: nowIso(), actualDay: today };
    if (i > state.sessionIndex && lateBy > 0) return { ...s, day: s.day + lateBy };
    return s;
  });
  const nextIndex = state.sessionIndex + 1;
  const done = nextIndex >= sessions.length;
  return {
    ...state,
    sessions,
    sessionIndex: nextIndex,
    taskIndex: 0,
    itemIndex: 0,
    passIndex: 0,
    order: [],
    offSchedule: state.offSchedule || lateBy > 0,
    phase: done ? 'done' : 'waiting',
  };
}

export function currentItemId(state: SpacingState): string | undefined {
  return state.order[state.itemIndex];
}

/** A pair was shown (learn-curve first look). */
export function advanceLearn(state: SpacingState, today: number, rngSeed: number): SpacingState {
  if (state.itemIndex + 1 < state.order.length) return { ...state, itemIndex: state.itemIndex + 1 };
  // First look done: one recall pass over the curve set follows, as pass 1.
  if (state.passIndex === 0) {
    return {
      ...state,
      passIndex: 1,
      itemIndex: 0,
      order: new Rng(rngSeed).shuffle(state.curveIds),
    };
  }
  return finishTask({ ...state, learnCurveAt: nowIso() }, today);
}

/** One typed attempt inside a pass, a learn-curve recall pass, a curve test or the final test. */
export function recordAttempt(
  state: SpacingState,
  typed: string,
  today: number,
  rngSeed: number,
): SpacingState & { lastCorrect: boolean; lastId: string } {
  const task = currentTask(state);
  const id = currentItemId(state);
  const pair = id ? pairById(id) : undefined;
  const correct = pair ? answerMatches(typed, pair.accept) : false;
  if (!task || !id) return { ...state, lastCorrect: false, lastId: id ?? '' };
  const clean = typed.slice(0, 80);
  let next: SpacingState = state;
  switch (task.kind) {
    case 'learn-curve': {
      next = {
        ...state,
        log: [...state.log, { day: today, set: 'curve', pass: 1, id, typed: clean, correct }],
      };
      if (state.itemIndex + 1 < state.order.length)
        next = { ...next, itemIndex: state.itemIndex + 1 };
      else next = finishTask({ ...next, learnCurveAt: nowIso() }, today);
      break;
    }
    case 'pass': {
      next = {
        ...state,
        log: [
          ...state.log,
          { day: today, set: task.set, pass: state.passIndex + 1, id, typed: clean, correct },
        ],
      };
      if (state.itemIndex + 1 < state.order.length)
        next = { ...next, itemIndex: state.itemIndex + 1 };
      else if (state.passIndex + 1 < task.passes) {
        next = {
          ...next,
          passIndex: state.passIndex + 1,
          itemIndex: 0,
          order: new Rng(rngSeed).shuffle(idsFor(state, task.set)),
        };
      } else next = finishTask(next, today);
      break;
    }
    case 'curve-test': {
      next = {
        ...state,
        log: [...state.log, { day: today, set: 'curve', pass: 0, id, typed: clean, correct }],
      };
      if (state.itemIndex + 1 < state.order.length)
        next = { ...next, itemIndex: state.itemIndex + 1 };
      else {
        const tested = state.order;
        const correctCount = next.log.filter(
          (a) => a.pass === 0 && a.set === 'curve' && tested.includes(a.id) && a.correct,
        ).length;
        next = {
          ...next,
          curveResults: [
            ...state.curveResults,
            { fifth: task.fifth, day: today, correct: correctCount, n: tested.length },
          ],
        };
        next = finishTask(next, today);
      }
      break;
    }
    case 'final-test': {
      next = { ...state, finalLog: [...state.finalLog, { id, typed: clean, correct }] };
      if (state.itemIndex + 1 < state.order.length)
        next = { ...next, itemIndex: state.itemIndex + 1 };
      else next = finishTask(next, today);
      break;
    }
    default:
      break;
  }
  return { ...next, lastCorrect: correct, lastId: id };
}

export function recordRating(state: SpacingState, value: number, today: number): SpacingState {
  const task = currentTask(state);
  if (task?.kind !== 'rate') return state;
  return finishTask(
    { ...state, ratings: [...state.ratings, { day: today, set: task.set, value }] },
    today,
  );
}

export function recordFinalPredictions(
  state: SpacingState,
  spaced: number,
  crammed: number,
  today: number,
): SpacingState {
  return finishTask({ ...state, predictions: { spaced, crammed } }, today);
}

export function recordHonesty(
  state: SpacingState,
  honesty: 'clean' | 'peeked' | 'unsure',
  today: number,
): SpacingState {
  return finishTask({ ...state, honesty }, today);
}

export function finalScore(
  state: SpacingState,
): Record<'spaced' | 'crammed', { correct: number; n: number }> {
  const out = { spaced: { correct: 0, n: 0 }, crammed: { correct: 0, n: 0 } };
  for (const a of state.finalLog) {
    const set = state.spacedIds.includes(a.id) ? 'spaced' : 'crammed';
    out[set].n++;
    if (a.correct) out[set].correct++;
  }
  return out;
}

/** Accuracy of the last pass of each set, which is how the set felt at the end of study. */
export function lastPassAccuracy(state: SpacingState, set: 'spaced' | 'crammed'): number | null {
  const passes = state.log.filter((a) => a.set === set && a.pass > 0);
  if (passes.length === 0) return null;
  const lastDay = Math.max(...passes.map((a) => a.day));
  const lastPass = Math.max(...passes.filter((a) => a.day === lastDay).map((a) => a.pass));
  const attempts = passes.filter((a) => a.day === lastDay && a.pass === lastPass);
  return Math.round((100 * attempts.filter((a) => a.correct).length) / attempts.length);
}

export function finalTestDone(state: SpacingState): boolean {
  return state.finalLog.length > 0 && state.honesty !== null;
}

export function computeResult(state: SpacingState): RunResult {
  const s = finalScore(state);
  const extras: Record<string, number> = {};
  for (const c of state.curveResults)
    extras[`curve${c.fifth}Pct`] = Math.round((100 * c.correct) / Math.max(1, c.n));
  const lastSpaced = lastPassAccuracy(state, 'spaced');
  const lastCrammed = lastPassAccuracy(state, 'crammed');
  if (lastSpaced !== null) extras['lastPassSpacedPct'] = lastSpaced;
  if (lastCrammed !== null) extras['lastPassCrammedPct'] = lastCrammed;
  const firstSpacedRating = state.ratings.find((r) => r.set === 'spaced');
  const crammedRating = state.ratings.find((r) => r.set === 'crammed');
  if (firstSpacedRating) extras['firstRatingSpaced'] = firstSpacedRating.value;
  if (crammedRating) extras['ratingCrammed'] = crammedRating.value;
  return buildResult(
    {
      key: 'spaced',
      label: 'Spaced',
      correct: s.spaced.correct,
      n: s.spaced.n,
      predicted: state.predictions.spaced,
      predictedOf: state.spacedIds.length,
    },
    {
      key: 'crammed',
      label: 'Crammed',
      correct: s.crammed.correct,
      n: s.crammed.n,
      predicted: state.predictions.crammed,
      predictedOf: state.crammedIds.length,
    },
    { honesty: state.honesty ?? 'clean', extras },
  );
}

export function parseState(run: Run): SpacingState | null {
  const parsed = SpacingStateSchema.safeParse(run.state);
  return parsed.success ? parsed.data : null;
}

export function sessionTitle(session: Session, index: number, total: number): string {
  const kinds = session.tasks.map((t) => t.kind);
  if (kinds.includes('final-test')) return 'Test day';
  if (kinds.length === 1 && kinds[0] === 'curve-test') return 'Forgetting curve check';
  if (kinds.some((k) => k === 'pass')) return `Study session ${index + 1} of ${total}`;
  return `Session ${index + 1}`;
}

export function describeNext(
  run: Run,
  teacher: TeacherSettings,
  now = new Date(),
): { label: string; ready: boolean } {
  const state = parseState(run);
  if (!state) return { label: 'This run cannot be read.', ready: false };
  if (state.phase === 'done') return { label: 'All sessions done', ready: true };
  const session = currentSession(state);
  if (!session) return { label: 'All sessions done', ready: true };
  const gate = sessionGate(run, state, teacher, now);
  const isTest = session.tasks.some((t) => t.kind === 'final-test');
  const isCurve = session.tasks.every((t) => t.kind === 'curve-test');
  const what = isTest
    ? 'Test day'
    : isCurve
      ? 'Forgetting curve check'
      : `Study session for day ${session.day}`;
  if (gate.ready) return { label: `${what}: open now`, ready: true };
  if (gate.waitMinutes > 0)
    return { label: `Ten-minute check in ${gate.waitMinutes} min`, ready: false };
  const days = gate.dueDay - gate.today;
  return { label: `${what} in ${days} ${days === 1 ? 'day' : 'days'}`, ready: false };
}
