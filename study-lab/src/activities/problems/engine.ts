import { z } from 'zod';
import { SOLIDS, makeProblem, volumeIsRight, type SolidId } from '../../content/solids.ts';
import type { Run, RunResult, TeacherSettings } from '../../data/schemas.ts';
import { dayIndex } from '../../lib/dates.ts';
import { Rng, shuffleNoRepeats } from '../../lib/rng.ts';
import { buildResult } from '../common.ts';

/**
 * Mixed problem set. Two practice sessions and a test, a week apart by default.
 *
 * Rohrer and Taylor (2007): students learned to find the volume of four unusual solids.
 * Practising one solid at a time felt easy and went well; practising the four mixed up felt
 * harder and went worse; a week later, the mixed group scored 63% against 20%. Here two of the
 * solids are practised blocked and two mixed, decided by the seed, so each student carries
 * both conditions. The test has two new problems per solid, with no formula sheet.
 */

export const PRACTICE_PER_SOLID = 4;
export const TEST_PER_SOLID = 2;
export type Condition = 'blocked' | 'interleaved';

const SolidIdSchema = z.enum(['wedge', 'spheroid', 'sphericalCone', 'halfCone']);

const PlannedProblem = z.object({
  id: z.string(),
  solidId: SolidIdSchema,
  dims: z.record(z.string(), z.number()),
  answer: z.number(),
  condition: z.enum(['blocked', 'interleaved']),
});
export type PlannedProblem = z.infer<typeof PlannedProblem>;

const SessionSchema = z.object({
  day: z.number().int().min(0),
  kind: z.enum(['practice', 'test']),
  blockOrder: z.array(z.enum(['blocked', 'interleaved'])).length(2),
  problems: z.array(PlannedProblem),
  doneAt: z.string().optional(),
  actualDay: z.number().int().optional(),
  predictions: z.object({ blocked: z.number().nullable(), interleaved: z.number().nullable() }),
});
export type Session = z.infer<typeof SessionSchema>;

export const ProblemsStateSchema = z.object({
  phase: z.enum(['session', 'waiting', 'done']),
  gapDays: z.number().int(),
  blockedSolids: z.array(SolidIdSchema).length(2),
  interleavedSolids: z.array(SolidIdSchema).length(2),
  sessions: z.array(SessionSchema).length(3),
  sessionIndex: z.number().int().min(0),
  tutorialIndex: z.number().int().min(0),
  tutorialDone: z.boolean(),
  itemIndex: z.number().int().min(0),
  predictStep: z.number().int().min(0).max(2),
  log: z.array(
    z.object({
      session: z.number().int(),
      problemId: z.string(),
      solidId: SolidIdSchema,
      condition: z.enum(['blocked', 'interleaved']),
      typed: z.string(),
      correct: z.boolean(),
    }),
  ),
  honesty: z.enum(['clean', 'peeked', 'unsure']).nullable(),
  offSchedule: z.boolean(),
});
export type ProblemsState = z.infer<typeof ProblemsStateSchema>;

function practiceProblems(
  rng: Rng,
  blocked: SolidId[],
  interleaved: SolidId[],
  tag: string,
): { blockOrder: Condition[]; problems: PlannedProblem[] } {
  const blockedList: PlannedProblem[] = blocked.flatMap((s) =>
    Array.from({ length: PRACTICE_PER_SOLID }, (_, i) => ({
      ...makeProblem(rng, s, i),
      id: `${tag}-${s}-${i}`,
      condition: 'blocked' as const,
    })),
  );
  const mixed: PlannedProblem[] = interleaved.flatMap((s) =>
    Array.from({ length: PRACTICE_PER_SOLID }, (_, i) => ({
      ...makeProblem(rng, s, i),
      id: `${tag}-${s}-${i}`,
      condition: 'interleaved' as const,
    })),
  );
  const interleavedList = shuffleNoRepeats(rng.fork(), mixed, (p) => p.solidId);
  const blockOrder: Condition[] =
    rng.next() < 0.5 ? ['blocked', 'interleaved'] : ['interleaved', 'blocked'];
  const problems =
    blockOrder[0] === 'blocked'
      ? [...blockedList, ...interleavedList]
      : [...interleavedList, ...blockedList];
  return { blockOrder, problems };
}

export function createPlan(seed: number, teacher: TeacherSettings): ProblemsState {
  const rng = new Rng(seed);
  const solids = rng.shuffle(SOLIDS.map((s) => s.id));
  const blockedSolids = solids.slice(0, 2);
  const interleavedSolids = solids.slice(2, 4);
  const gap = teacher.problemsGapDays;
  const s1 = practiceProblems(rng.fork(), blockedSolids, interleavedSolids, 's1');
  const s2 = practiceProblems(rng.fork(), blockedSolids, interleavedSolids, 's2');
  const testRng = rng.fork();
  const testProblems: PlannedProblem[] = [...blockedSolids, ...interleavedSolids].flatMap((s) =>
    Array.from({ length: TEST_PER_SOLID }, (_, i) => ({
      ...makeProblem(testRng, s, 10 + i),
      id: `t-${s}-${i}`,
      condition: (blockedSolids.includes(s) ? 'blocked' : 'interleaved') as Condition,
    })),
  );
  const empty = { blocked: null, interleaved: null };
  return {
    phase: 'session',
    gapDays: gap,
    blockedSolids,
    interleavedSolids,
    sessions: [
      {
        day: 0,
        kind: 'practice',
        blockOrder: s1.blockOrder,
        problems: s1.problems,
        predictions: { ...empty },
      },
      {
        day: gap,
        kind: 'practice',
        blockOrder: s2.blockOrder,
        problems: s2.problems,
        predictions: { ...empty },
      },
      {
        day: 2 * gap,
        kind: 'test',
        blockOrder: ['blocked', 'interleaved'],
        problems: shuffleNoRepeats(testRng, testProblems, (p) => p.solidId),
        predictions: { ...empty },
      },
    ],
    sessionIndex: 0,
    tutorialIndex: 0,
    tutorialDone: false,
    itemIndex: 0,
    predictStep: 0,
    log: [],
    honesty: null,
    offSchedule: false,
  };
}

/** The student has opened today's session. */
export function startSession(state: ProblemsState): ProblemsState {
  if (state.phase !== 'waiting') return state;
  return { ...state, phase: 'session', itemIndex: 0, predictStep: 0 };
}

export function currentSession(state: ProblemsState): Session | undefined {
  return state.sessions[state.sessionIndex];
}

export function currentProblem(state: ProblemsState): PlannedProblem | undefined {
  return currentSession(state)?.problems[state.itemIndex];
}

export interface Gate {
  ready: boolean;
  today: number;
  dueDay: number;
  late: boolean;
}

export function sessionGate(
  run: Run,
  state: ProblemsState,
  teacher: TeacherSettings,
  now = new Date(),
): Gate {
  const today = dayIndex(run.startedAt, now);
  const session = currentSession(state);
  const dueDay = session?.day ?? 0;
  return { ready: teacher.allowEarlyTests || today >= dueDay, today, dueDay, late: today > dueDay };
}

export function advanceTutorial(state: ProblemsState): ProblemsState {
  if (state.tutorialIndex + 1 < SOLIDS.length)
    return { ...state, tutorialIndex: state.tutorialIndex + 1 };
  return { ...state, tutorialDone: true };
}

/** The condition of the block the current problem sits in. */
export function currentCondition(state: ProblemsState): Condition {
  return currentProblem(state)?.condition ?? 'blocked';
}

export function recordAnswer(
  state: ProblemsState,
  typed: string,
): ProblemsState & { lastCorrect: boolean } {
  const problem = currentProblem(state);
  if (!problem) return { ...state, lastCorrect: false };
  const correct = volumeIsRight(typed, problem.answer);
  const log = [
    ...state.log,
    {
      session: state.sessionIndex,
      problemId: problem.id,
      solidId: problem.solidId,
      condition: problem.condition,
      typed: typed.slice(0, 40),
      correct,
    },
  ];
  return { ...state, log, lastCorrect: correct };
}

/** After feedback (or straight after the answer in the test), move on. */
export function advanceProblem(state: ProblemsState): ProblemsState {
  const session = currentSession(state);
  if (!session) return state;
  if (state.itemIndex + 1 < session.problems.length)
    return { ...state, itemIndex: state.itemIndex + 1 };
  if (session.kind === 'practice') return { ...state, predictStep: 1 };
  // Test finished: the honesty question comes next.
  return { ...state, predictStep: 1 };
}

export function recordPredictions(
  state: ProblemsState,
  blocked: number,
  interleaved: number,
  today: number,
): ProblemsState {
  const session = currentSession(state);
  if (!session) return state;
  const sessions = state.sessions.map((s, i) =>
    i === state.sessionIndex ? { ...s, predictions: { blocked, interleaved } } : s,
  );
  return finishSession({ ...state, sessions }, today);
}

export function recordHonesty(
  state: ProblemsState,
  honesty: 'clean' | 'peeked' | 'unsure',
  today: number,
): ProblemsState {
  return finishSession({ ...state, honesty }, today);
}

function finishSession(state: ProblemsState, today: number): ProblemsState {
  const session = currentSession(state);
  if (!session) return state;
  const lateBy = Math.max(0, today - session.day);
  const sessions = state.sessions.map((s, i) => {
    if (i === state.sessionIndex)
      return { ...s, doneAt: new Date().toISOString(), actualDay: today };
    if (i > state.sessionIndex && lateBy > 0) return { ...s, day: s.day + lateBy };
    return s;
  });
  const nextIndex = state.sessionIndex + 1;
  return {
    ...state,
    sessions,
    sessionIndex: nextIndex,
    itemIndex: 0,
    predictStep: 0,
    offSchedule: state.offSchedule || lateBy > 0,
    phase: nextIndex >= sessions.length ? 'done' : 'waiting',
  };
}

export function accuracy(
  state: ProblemsState,
  sessionIndex: number,
  condition: Condition,
): { correct: number; n: number } {
  const attempts = state.log.filter((a) => a.session === sessionIndex && a.condition === condition);
  return { correct: attempts.filter((a) => a.correct).length, n: attempts.length };
}

export function computeResult(state: ProblemsState): RunResult {
  const test = state.sessions.length - 1;
  const inter = accuracy(state, test, 'interleaved');
  const block = accuracy(state, test, 'blocked');
  const extras: Record<string, number> = {};
  for (let s = 0; s < test; s++) {
    const b = accuracy(state, s, 'blocked');
    const i = accuracy(state, s, 'interleaved');
    if (b.n > 0) extras[`practice${s + 1}BlockedPct`] = Math.round((100 * b.correct) / b.n);
    if (i.n > 0) extras[`practice${s + 1}InterleavedPct`] = Math.round((100 * i.correct) / i.n);
  }
  const lastPractice = state.sessions[test - 1]?.predictions ?? {
    blocked: null,
    interleaved: null,
  };
  return buildResult(
    {
      key: 'interleaved',
      label: 'Mixed',
      correct: inter.correct,
      n: inter.n,
      predicted: lastPractice.interleaved,
      predictedOf: TEST_PER_SOLID * 2,
    },
    {
      key: 'blocked',
      label: 'Blocked',
      correct: block.correct,
      n: block.n,
      predicted: lastPractice.blocked,
      predictedOf: TEST_PER_SOLID * 2,
    },
    { honesty: state.honesty ?? 'clean', extras },
  );
}

export function parseState(run: Run): ProblemsState | null {
  const parsed = ProblemsStateSchema.safeParse(run.state);
  return parsed.success ? parsed.data : null;
}

export function describeNext(
  run: Run,
  teacher: TeacherSettings,
  now = new Date(),
): { label: string; ready: boolean } {
  const state = parseState(run);
  if (!state) return { label: 'This run cannot be read.', ready: false };
  if (state.phase === 'done') return { label: 'Your results are ready', ready: true };
  const session = currentSession(state);
  if (!session) return { label: 'Your results are ready', ready: true };
  const gate = sessionGate(run, state, teacher, now);
  const what = session.kind === 'test' ? 'The test' : `Practice session ${state.sessionIndex + 1}`;
  if (gate.ready) return { label: `${what}: open now`, ready: true };
  const days = gate.dueDay - gate.today;
  return { label: `${what} in ${days} ${days === 1 ? 'day' : 'days'}`, ready: false };
}
