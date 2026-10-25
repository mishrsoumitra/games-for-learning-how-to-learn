import { useMemo } from 'react';
import { runs, settings, useRuns } from '../data/repo.ts';
import type {
  ActivityId,
  ConditionResult,
  Run,
  RunResult,
  TeacherSettings,
} from '../data/schemas.ts';
import { nowIso } from '../lib/dates.ts';
import { newId, randomSeed } from '../lib/ids.ts';
import { percent } from '../lib/stats.ts';

export function teacherSettings(): TeacherSettings {
  return settings.get().teacher;
}

export async function createRun(
  activity: ActivityId,
  state: unknown,
  seed = randomSeed(),
): Promise<Run> {
  const t = nowIso();
  return runs.put({
    id: newId(),
    activity,
    seed,
    status: 'in-progress',
    startedAt: t,
    updatedAt: t,
    offSchedule: false,
    state,
  });
}

export async function saveRunState(
  run: Run,
  state: unknown,
  patch: Partial<Pick<Run, 'offSchedule'>> = {},
): Promise<Run> {
  return runs.put({ ...run, ...patch, state, updatedAt: nowIso() });
}

/** Marks a run complete with its result. Keeps the first completion time if it is saved again. */
export async function finishRun(
  run: Run,
  state: unknown,
  result: RunResult,
  offSchedule = run.offSchedule,
): Promise<Run> {
  const t = nowIso();
  return runs.put({
    ...run,
    state,
    result,
    offSchedule,
    status: 'complete',
    completedAt: run.completedAt ?? t,
    updatedAt: t,
  });
}

export async function abandonRun(run: Run): Promise<Run> {
  return runs.put({ ...run, status: 'abandoned', updatedAt: nowIso() });
}

export async function deleteRun(run: Run): Promise<void> {
  await runs.remove(run.id);
}

export function useRun(runId: string | undefined): Run | undefined {
  const all = useRuns();
  return useMemo(() => (runId ? all.find((r) => r.id === runId) : undefined), [all, runId]);
}

/** The most recent run of an activity that is still going. */
export function activeRun(all: readonly Run[], activity: ActivityId): Run | undefined {
  return all
    .filter((r) => r.activity === activity && r.status === 'in-progress')
    .sort((a, b) => b.startedAt.localeCompare(a.startedAt))[0];
}

export function completedRuns(all: readonly Run[], activity?: ActivityId): Run[] {
  return all
    .filter((r) => r.status === 'complete' && (activity === undefined || r.activity === activity))
    .sort((a, b) => (b.completedAt ?? '').localeCompare(a.completedAt ?? ''));
}

export interface ConditionInput {
  key: string;
  label: string;
  correct: number;
  n: number;
  /** The student's prediction as a count out of `predictedOf`, or null. */
  predicted: number | null;
  predictedOf?: number;
}

function condition(input: ConditionInput): ConditionResult {
  const of = input.predictedOf ?? input.n;
  return {
    key: input.key,
    label: input.label,
    predictedPct: input.predicted === null ? null : percent(input.predicted, of),
    scoredPct: percent(input.correct, input.n),
    correct: input.correct,
    n: input.n,
  };
}

/**
 * Builds the result record. `first` is the condition the research says works better, so a
 * positive gap means the student's data agree with the published pattern.
 */
export function buildResult(
  first: ConditionInput,
  second: ConditionInput,
  options: {
    honesty?: RunResult['honesty'];
    extras?: Record<string, number>;
    summary?: string;
  } = {},
): RunResult {
  const a = condition(first);
  const b = condition(second);
  const predictedGap =
    a.predictedPct === null || b.predictedPct === null ? null : a.predictedPct - b.predictedPct;
  return {
    conditions: [a, b],
    gapPct: a.scoredPct - b.scoredPct,
    predictedGapPct: predictedGap,
    honesty: options.honesty ?? 'clean',
    extras: options.extras ?? {},
    summary: options.summary ?? '',
  };
}

/** One plain sentence about how feeling and result compared. */
export function feelingVersusResult(result: RunResult): string {
  const [a, b] = result.conditions;
  if (!a || !b) return '';
  const felt =
    result.predictedGapPct === null
      ? ''
      : result.predictedGapPct > 0
        ? `You expected ${a.label.toLowerCase()} to do better. `
        : result.predictedGapPct < 0
          ? `You expected ${b.label.toLowerCase()} to do better. `
          : 'You expected both to do the same. ';
  const did =
    result.gapPct > 0
      ? `${a.label} did better, by ${result.gapPct} points.`
      : result.gapPct < 0
        ? `${b.label} did better, by ${-result.gapPct} points.`
        : 'Both scored the same.';
  return felt + did;
}
