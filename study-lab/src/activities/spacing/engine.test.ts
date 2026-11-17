import { describe, expect, it } from 'vitest';
import { pairById } from '../../content/swahili.ts';
import { TeacherSettingsSchema, type Run } from '../../data/schemas.ts';
import {
  advanceLearn,
  beginTask,
  buildSessions,
  computeResult,
  createPlan,
  currentItemId,
  currentTask,
  recordAttempt,
  recordFinalPredictions,
  recordHonesty,
  recordRating,
  sessionGate,
  startSession,
  type SpacingState,
} from './engine.ts';

const teacher = TeacherSettingsSchema.parse({});

/** Plays every task of the current session, answering `right` on typed items. */
function playSession(
  state: SpacingState,
  today: number,
  right: (set: string, id: string) => boolean,
): SpacingState {
  let s = startSession(state);
  const sessionIndex = s.sessionIndex;
  let guard = 0;
  while (s.sessionIndex === sessionIndex && s.phase === 'session' && guard++ < 5000) {
    const task = currentTask(s);
    if (!task) break;
    if (
      s.order.length === 0 &&
      task.kind !== 'rate' &&
      task.kind !== 'final-predict' &&
      task.kind !== 'honesty'
    ) {
      s = beginTask(s, 1);
    }
    switch (task.kind) {
      case 'learn-curve':
        if (s.passIndex === 0) s = advanceLearn(s, today, 2);
        else {
          const id = currentItemId(s) ?? '';
          const {
            lastCorrect: _a,
            lastId: _b,
            ...rest
          } = recordAttempt(s, right('curve', id) ? (pairById(id)?.answer ?? '') : 'x', today, 3);
          s = rest;
        }
        break;
      case 'pass':
      case 'curve-test':
      case 'final-test': {
        const id = currentItemId(s) ?? '';
        const set =
          task.kind === 'pass' ? task.set : task.kind === 'curve-test' ? 'curve' : 'final';
        const {
          lastCorrect: _a,
          lastId: _b,
          ...rest
        } = recordAttempt(s, right(set, id) ? (pairById(id)?.answer ?? '') : 'x', today, 3);
        s = rest;
        break;
      }
      case 'rate':
        s = recordRating(s, 10, today);
        break;
      case 'final-predict':
        s = recordFinalPredictions(s, 15, 12, today);
        break;
      case 'honesty':
        s = recordHonesty(s, 'clean', today);
        break;
    }
  }
  return s;
}

describe('spacing schedule', () => {
  it('builds seven sessions with the curve and five without', () => {
    expect(buildSessions(5, true).map((s) => s.day)).toEqual([0, 1, 2, 3, 4, 5, 7]);
    expect(buildSessions(5, false).map((s) => s.day)).toEqual([0, 1, 2, 3, 5]);
  });

  it('gives the two sets the same number of passes', () => {
    const sessions = buildSessions(5, true);
    const passes = { spaced: 0, crammed: 0 };
    for (const s of sessions)
      for (const t of s.tasks) if (t.kind === 'pass') passes[t.set] += t.passes;
    expect(passes).toEqual({ spaced: 4, crammed: 4 });
  });
});

describe('spacing flow', () => {
  it('plays day 0 and waits for day 1', () => {
    let s = createPlan(4, teacher);
    s = playSession(s, 0, () => true);
    expect(s.phase).toBe('waiting');
    expect(s.sessionIndex).toBe(1);
    expect(s.log.filter((a) => a.set === 'spaced')).toHaveLength(20);
    expect(s.log.filter((a) => a.set === 'curve' && a.pass === 1)).toHaveLength(20);
    expect(s.curveResults).toHaveLength(1);
    expect(s.ratings).toEqual([{ day: 0, set: 'spaced', value: 10 }]);
  });

  it('waits ten minutes before the first curve check', () => {
    let s = createPlan(4, teacher);
    const run = { startedAt: new Date().toISOString() } as Run;
    // Play through learn-curve, the pass and the rating only.
    let guard = 0;
    while (currentTask(s)?.kind !== 'curve-test' && guard++ < 2000) {
      const task = currentTask(s);
      if (!task) break;
      if (s.order.length === 0 && task.kind !== 'rate') s = beginTask(s, 1);
      if (task.kind === 'learn-curve') {
        if (s.passIndex === 0) s = advanceLearn(s, 0, 2);
        else s = recordAttempt(s, 'x', 0, 3);
      } else if (task.kind === 'pass') s = recordAttempt(s, 'x', 0, 3);
      else if (task.kind === 'rate') s = recordRating(s, 5, 0);
    }
    const gate = sessionGate(run, s, teacher);
    expect(gate.ready).toBe(false);
    expect(gate.waitMinutes).toBeGreaterThan(8);
    expect(sessionGate(run, s, { ...teacher, allowEarlyTests: true }).ready).toBe(true);
  });

  it('shifts later sessions when one is done late and marks the run off schedule', () => {
    let s = createPlan(9, teacher);
    s = playSession(s, 0, () => true);
    s = playSession(s, 3, () => true); // day 1 session done on day 3
    expect(s.offSchedule).toBe(true);
    expect(s.sessions.map((x) => x.day)).toEqual([0, 1, 4, 5, 6, 7, 9]);
  });

  it('runs to the end and scores spaced against crammed', () => {
    let s = createPlan(12, teacher);
    const days = s.sessions.map((x) => x.day);
    for (const day of days) {
      s = playSession(s, day, (set, id) => set !== 'final' || s.spacedIds.includes(id));
    }
    expect(s.phase).toBe('done');
    const result = computeResult(s);
    expect(result.conditions[0]?.key).toBe('spaced');
    expect(result.conditions[0]?.scoredPct).toBe(100);
    expect(result.conditions[1]?.scoredPct).toBe(0);
    expect(result.predictedGapPct).toBe(15);
    expect(Object.keys(result.extras).filter((k) => k.startsWith('curve'))).toHaveLength(5);
    expect(result.extras['curve4Pct']).toBe(100);
  });
});
