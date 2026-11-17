import { useNavigate } from 'react-router';
import { ActivityIntro } from '../../components/ActivityIntro.tsx';
import { useSettings } from '../../data/repo.ts';
import { randomSeed } from '../../lib/ids.ts';
import { createRun, teacherSettings } from '../common.ts';
import { createPlan } from './engine.ts';

export default function ProblemsIntro() {
  const navigate = useNavigate();
  const settings = useSettings();
  const gap = settings.teacher.problemsGapDays;
  const steps = [
    'A short tutorial: four solids you have probably never met (a wedge, a spheroid, a spherical cone and a half cone), each with its volume formula and one worked example.',
    'Then 16 practice problems. For two of the solids the problems come in blocks, four of one solid then four of the other. For the other two solids the eight problems are mixed. The formula sheet is gone; you recall the formula, work it out with a calculator, type the answer, and see the right one.',
    'You say how many test problems on each pair of solids you expect to get right.',
    `${gap} ${gap === 1 ? 'day' : 'days'} later, a second practice session of 16 problems, same arrangement.`,
    `${gap} ${gap === 1 ? 'day' : 'days'} after that, a test: two new problems per solid, mixed, no formula sheet, no feedback until the end.`,
  ];
  return (
    <ActivityIntro
      activity="problems"
      steps={steps}
      onStart={async () => {
        const seed = randomSeed();
        const run = await createRun('problems', createPlan(seed, teacherSettings()), seed);
        void navigate(`/activities/problems/run/${run.id}`);
        return run;
      }}
    >
      <section className="card stack">
        <h3>Before you start</h3>
        <p>
          Keep a calculator next to you. Answers within one percent count as right, so round to one
          decimal place. Do not write the formulas down anywhere: the whole point is whether you can
          bring them back a week later.
        </p>
      </section>
    </ActivityIntro>
  );
}
