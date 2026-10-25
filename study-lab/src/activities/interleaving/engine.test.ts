import { describe, expect, it } from 'vitest';
import { TeacherSettingsSchema } from '../../data/schemas.ts';
import {
  advanceStudy,
  answerTest,
  computeResult,
  createPlan,
  currentCondition,
  setPrediction,
  startTest,
  STUDY_PER_PAINTER,
  TEST_PER_PAINTER,
} from './engine.ts';

const teacher = TeacherSettingsSchema.parse({});

describe('interleaving plan', () => {
  it('splits painters evenly and makes 6 study and 2 test paintings each', () => {
    const plan = createPlan(123, teacher);
    expect(plan.blockedIds).toHaveLength(6);
    expect(plan.interleavedIds).toHaveLength(6);
    expect(new Set([...plan.blockedIds, ...plan.interleavedIds]).size).toBe(12);
    expect(plan.study.blocked).toHaveLength(6 * STUDY_PER_PAINTER);
    expect(plan.study.interleaved).toHaveLength(6 * STUDY_PER_PAINTER);
    expect(plan.test).toHaveLength(12 * TEST_PER_PAINTER);
  });

  it('keeps blocked paintings together and interleaved ones apart', () => {
    const plan = createPlan(7, teacher);
    let switches = 0;
    for (let i = 1; i < plan.study.blocked.length; i++) {
      if (plan.study.blocked[i]?.painterId !== plan.study.blocked[i - 1]?.painterId) switches++;
    }
    expect(switches).toBe(5);
    for (let i = 1; i < plan.study.interleaved.length; i++) {
      expect(plan.study.interleaved[i]?.painterId).not.toBe(
        plan.study.interleaved[i - 1]?.painterId,
      );
    }
  });

  it('never reuses a study painting in the test', () => {
    const plan = createPlan(99, teacher);
    const studySeeds = new Set(
      [...plan.study.blocked, ...plan.study.interleaved].map((s) => s.seed),
    );
    for (const t of plan.test) expect(studySeeds.has(t.seed)).toBe(false);
  });

  it('is the same for the same seed and different across seeds', () => {
    expect(createPlan(5, teacher)).toEqual(createPlan(5, teacher));
    expect(createPlan(5, teacher).blockedIds).not.toEqual(createPlan(6, teacher).blockedIds);
  });

  it('respects a smaller painter count from the teacher settings', () => {
    const plan = createPlan(1, { ...teacher, artistCount: 4 });
    expect(plan.blockedIds).toHaveLength(2);
    expect(plan.test).toHaveLength(8);
  });
});

describe('interleaving flow and scoring', () => {
  it('walks study, rating, second phase, filler and test, then scores by condition', () => {
    let state = createPlan(42, { ...teacher, artistCount: 4 });
    const first = currentCondition(state);
    for (let i = 0; i < 2 * STUDY_PER_PAINTER; i++) state = advanceStudy(state);
    expect(state.phase).toBe('rate');
    state = setPrediction(state, 3);
    expect(state.phase).toBe('study');
    expect(currentCondition(state)).not.toBe(first);
    for (let i = 0; i < 2 * STUDY_PER_PAINTER; i++) state = advanceStudy(state);
    state = setPrediction(state, 1);
    expect(state.phase).toBe('filler');
    state = startTest(state);
    for (const item of state.test) state = answerTest(state, item.painterId);
    expect(state.phase).toBe('done');
    const result = computeResult(state);
    expect(result.conditions[0]?.key).toBe('interleaved');
    expect(result.conditions[0]?.scoredPct).toBe(100);
    expect(result.conditions[1]?.scoredPct).toBe(100);
    expect(result.gapPct).toBe(0);
    expect(result.predictedGapPct).not.toBeNull();
  });

  it('counts wrong and skipped answers as wrong', () => {
    let state = createPlan(8, { ...teacher, artistCount: 4 });
    state = startTest({ ...state, phase: 'filler' });
    state.test.forEach((item, i) => {
      state = answerTest(state, i % 2 === 0 ? null : item.painterId);
    });
    const result = computeResult(state);
    const total = (result.conditions[0]?.correct ?? 0) + (result.conditions[1]?.correct ?? 0);
    expect(total).toBe(4);
  });
});
