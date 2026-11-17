import { describe, expect, it } from 'vitest';
import { pairById } from '../../content/swahili.ts';
import { TeacherSettingsSchema, type Run } from '../../data/schemas.ts';
import {
  advanceReread,
  advanceStudy,
  afterRecallFeedback,
  computeResult,
  createPlan,
  currentBlockCondition,
  currentImmediateId,
  currentPracticeId,
  currentTestId,
  recordImmediate,
  recordRecall,
  recordTest,
  setHonesty,
  setPredictions,
  startTest,
  testUnlock,
  type RetrievalState,
} from './engine.ts';

const teacher = TeacherSettingsSchema.parse({});

function runPractice(state: RetrievalState, recallRight: boolean): RetrievalState {
  let s = state;
  let guard = 0;
  while (s.phase === 'practice' && guard++ < 1000) {
    const cond = currentBlockCondition(s);
    if (cond === 'reread') s = advanceReread(s);
    else {
      const id = currentPracticeId(s);
      const pair = id ? pairById(id) : undefined;
      const typed = recallRight && pair ? pair.answer : 'zzz';
      const { lastCorrect: _c, ...rest } = recordRecall(s, typed);
      s = afterRecallFeedback(rest);
    }
  }
  return s;
}

describe('retrieval plan', () => {
  it('splits forty pairs into two conditions and adds eight extras when the immediate test is on', () => {
    const plan = createPlan(3, teacher, true);
    expect(plan.rereadIds).toHaveLength(20);
    expect(plan.recallIds).toHaveLength(20);
    expect(plan.extraReread).toHaveLength(4);
    expect(plan.extraRecall).toHaveLength(4);
    expect(plan.studyOrder).toHaveLength(48);
    expect(plan.rounds).toHaveLength(3);
    expect(plan.rounds[0]?.reread).toHaveLength(24);
    expect(plan.testOrder).toHaveLength(40);
  });

  it('has no extras without the immediate test', () => {
    const plan = createPlan(3, teacher, false);
    expect(plan.studyOrder).toHaveLength(40);
    expect(plan.immediateOrder).toHaveLength(0);
  });

  it('alternates which block comes first across rounds', () => {
    const plan = createPlan(11, teacher, true);
    expect(plan.rounds[0]?.order[0]).not.toBe(plan.rounds[1]?.order[0]);
  });
});

describe('retrieval flow', () => {
  it('goes study, three rounds of practice, predictions, immediate test, waiting', () => {
    let s = createPlan(21, teacher, true);
    while (s.phase === 'study') s = advanceStudy(s);
    expect(s.phase).toBe('practice');
    s = runPractice(s, true);
    expect(s.phase).toBe('predict');
    expect(s.practiceLog).toHaveLength(3 * 24);
    s = setPredictions(s, 10, 12);
    expect(s.phase).toBe('immediate');
    while (s.phase === 'immediate') {
      const id = currentImmediateId(s);
      const pair = id ? pairById(id) : undefined;
      s = recordImmediate(s, pair && s.extraReread.includes(pair.id) ? pair.answer : 'wrong');
    }
    expect(s.phase).toBe('waiting');
    expect(s.immediateLog).toHaveLength(8);
  });

  it('locks the test until the delay has passed, unless the teacher allows early tests', () => {
    const state = createPlan(5, teacher, false);
    const run = { startedAt: new Date(2026, 9, 25, 10).toISOString() } as Run;
    expect(testUnlock(run, state, teacher, new Date(2026, 9, 26, 10)).ready).toBe(false);
    expect(testUnlock(run, state, teacher, new Date(2026, 9, 27, 0, 5)).ready).toBe(true);
    expect(
      testUnlock(run, state, { ...teacher, allowEarlyTests: true }, new Date(2026, 9, 25, 11))
        .ready,
    ).toBe(true);
    expect(testUnlock(run, state, teacher, new Date(2026, 9, 30)).late).toBe(true);
  });

  it('scores the final test by condition and keeps the immediate scores as extras', () => {
    let s = createPlan(8, teacher, true);
    while (s.phase === 'study') s = advanceStudy(s);
    s = runPractice(s, false);
    s = setPredictions(s, 10, 10);
    while (s.phase === 'immediate') s = recordImmediate(s, 'wrong');
    s = startTest(s, 2);
    while (s.phase === 'test') {
      const id = currentTestId(s);
      const pair = id ? pairById(id) : undefined;
      // Recalled pairs all right, reread pairs all wrong.
      s = recordTest(s, pair && s.recallIds.includes(pair.id) ? pair.answer : 'nope');
    }
    expect(s.phase).toBe('honesty');
    s = setHonesty(s, 'clean');
    const result = computeResult(s);
    expect(result.conditions[0]?.key).toBe('recall');
    expect(result.conditions[0]?.scoredPct).toBe(100);
    expect(result.conditions[1]?.scoredPct).toBe(0);
    expect(result.gapPct).toBe(100);
    expect(result.predictedGapPct).toBe(0);
    expect(result.extras['immediateRereadPct']).toBe(0);
    expect(result.extras['testDay']).toBe(2);
    expect(result.extras['practiceRecallRound1Pct']).toBe(0);
  });
});
