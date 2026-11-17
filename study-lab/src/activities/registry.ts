import type { ActivityId, Run, TeacherSettings } from '../data/schemas.ts';
import * as interleaving from './interleaving/engine.ts';
import * as problems from './problems/engine.ts';
import * as retrieval from './retrieval/engine.ts';
import * as spacing from './spacing/engine.ts';

export interface ActivityMeta {
  id: ActivityId;
  title: string;
  lecture: string;
  blurb: string;
  time: string;
  path: string;
  /** [the condition the research favours, the other one] */
  conditions: [string, string];
}

export const ACTIVITIES: readonly ActivityMeta[] = [
  {
    id: 'interleaving',
    title: 'Mixed or blocked',
    lecture: 'Lecture 6 · Chunking, and any lecture on practice',
    blurb:
      'Learn twelve painters. Half of them you study one painter at a time, half of them mixed up. Then name new paintings. Which way felt better, and which way worked?',
    time: 'About 15 minutes, one sitting',
    path: '/activities/interleaving',
    conditions: ['Mixed', 'Blocked'],
  },
  {
    id: 'retrieval',
    title: 'Reread or recall',
    lecture: 'Lecture 7 · Retrieval',
    blurb:
      'Learn forty Swahili words. Half of them you reread three times, half of them you try to recall three times. Two days later, a test on all forty.',
    time: 'About 20 minutes today, 10 minutes in two days',
    path: '/activities/retrieval',
    conditions: ['Recalled', 'Reread'],
  },
  {
    id: 'spacing',
    title: 'Cram or space',
    lecture: 'Lecture 8 · Spacing',
    blurb:
      'Two sets of twenty words. One set you study a little on four days. The other you study four times in one sitting. Then a test on both, and your own forgetting curve.',
    time: 'About 10 minutes a day for a week',
    path: '/activities/spacing',
    conditions: ['Spaced', 'Crammed'],
  },
  {
    id: 'problems',
    title: 'Mixed problem set',
    lecture: 'Lecture 6 · Chunking · a Maths version',
    blurb:
      'Four odd solids and their volume formulas. Two you practise one at a time, two you practise mixed. A week later, a test with no formula sheet.',
    time: 'Two 20-minute sessions, then a 10-minute test',
    path: '/activities/problems',
    conditions: ['Mixed', 'Blocked'],
  },
];

export function activityMeta(id: ActivityId): ActivityMeta {
  const meta = ACTIVITIES.find((a) => a.id === id);
  if (!meta) throw new Error(`Unknown activity ${id}`);
  return meta;
}

/** What the student should do next in a run, for the home page. */
export function describeNext(
  run: Run,
  teacher: TeacherSettings,
  now = new Date(),
): { label: string; ready: boolean } {
  switch (run.activity) {
    case 'interleaving':
      return interleaving.describeNext(run);
    case 'retrieval':
      return retrieval.describeNext(run, teacher, now);
    case 'spacing':
      return spacing.describeNext(run, teacher, now);
    case 'problems':
      return problems.describeNext(run, teacher, now);
  }
}
