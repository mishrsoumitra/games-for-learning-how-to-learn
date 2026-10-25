import { describe, expect, it } from 'vitest';
import { formatVolume } from '../../content/solids.ts';
import { TeacherSettingsSchema, type Run } from '../../data/schemas.ts';
import {
  advanceProblem,
  advanceTutorial,
  computeResult,
  createPlan,
  currentProblem,
  currentSession,
  recordAnswer,
  recordHonesty,
  recordPredictions,
  sessionGate,
  startSession,
  type ProblemsState,
} from './engine.ts';

const teacher = TeacherSettingsSchema.parse({});

function playSession(
  state: ProblemsState,
  today: number,
  right: (condition: string) => boolean,
): ProblemsState {
  let s = startSession(state);
  const session = currentSession(s);
  if (!session) return s;
  while (!s.tutorialDone) s = advanceTutorial(s);
  while (s.predictStep === 0) {
    const p = currentProblem(s);
    if (!p) break;
    const { lastCorrect: _c, ...rest } = recordAnswer(
      s,
      right(p.condition) ? formatVolume(p.answer) : '1',
    );
    s = advanceProblem(rest);
  }
  return session.kind === 'practice'
    ? recordPredictions(s, 3, 2, today)
    : recordHonesty(s, 'clean', today);
}

describe('problems plan', () => {
  it('assigns two solids to each condition and builds two practice sessions and a test', () => {
    const plan = createPlan(1, teacher);
    expect(plan.blockedSolids).toHaveLength(2);
    expect(plan.interleavedSolids).toHaveLength(2);
    expect(new Set([...plan.blockedSolids, ...plan.interleavedSolids]).size).toBe(4);
    expect(plan.sessions.map((s) => s.day)).toEqual([0, 7, 14]);
    expect(plan.sessions[0]?.problems).toHaveLength(16);
    expect(plan.sessions[2]?.problems).toHaveLength(8);
  });

  it('keeps blocked problems together and mixed ones apart', () => {
    const plan = createPlan(2, teacher);
    const session = plan.sessions[0];
    if (!session) throw new Error('no session');
    const blocked = session.problems.filter((p) => p.condition === 'blocked');
    let switches = 0;
    for (let i = 1; i < blocked.length; i++)
      if (blocked[i]?.solidId !== blocked[i - 1]?.solidId) switches++;
    expect(switches).toBe(1);
    const mixed = session.problems.filter((p) => p.condition === 'interleaved');
    for (let i = 1; i < mixed.length; i++)
      expect(mixed[i]?.solidId).not.toBe(mixed[i - 1]?.solidId);
  });

  it('uses a shorter gap from the teacher settings', () => {
    const plan = createPlan(2, { ...teacher, problemsGapDays: 2 });
    expect(plan.sessions.map((s) => s.day)).toEqual([0, 2, 4]);
  });
});

describe('problems flow', () => {
  it('gates sessions by day', () => {
    const state = createPlan(3, teacher);
    const run = { startedAt: new Date(2026, 9, 1, 9).toISOString() } as Run;
    expect(sessionGate(run, state, teacher, new Date(2026, 9, 1, 10)).ready).toBe(true);
    const after = playSession(state, 0, () => true);
    expect(sessionGate(run, after, teacher, new Date(2026, 9, 5)).ready).toBe(false);
    expect(sessionGate(run, after, teacher, new Date(2026, 9, 8)).ready).toBe(true);
  });

  it('scores the test by condition with practice accuracy kept as extras', () => {
    let s = createPlan(5, teacher);
    s = playSession(s, 0, (c) => c === 'blocked');
    expect(s.phase).toBe('waiting');
    s = playSession(s, 7, (c) => c === 'blocked');
    s = playSession(s, 14, (c) => c === 'interleaved');
    expect(s.phase).toBe('done');
    const result = computeResult(s);
    expect(result.conditions[0]?.key).toBe('interleaved');
    expect(result.conditions[0]?.scoredPct).toBe(100);
    expect(result.conditions[1]?.scoredPct).toBe(0);
    expect(result.extras['practice1BlockedPct']).toBe(100);
    expect(result.extras['practice1InterleavedPct']).toBe(0);
    expect(result.predictedGapPct).toBe(-25);
  });
});
