import { useNavigate } from 'react-router';
import { ActivityIntro } from '../../components/ActivityIntro.tsx';
import { randomSeed } from '../../lib/ids.ts';
import { createRun, teacherSettings } from '../common.ts';
import { createPlan } from './engine.ts';

const STEPS = [
  'You see 72 paintings, one at a time, three seconds each, with the painter’s name under each one. Twelve painters, six paintings each.',
  'Six of the painters come one painter at a time: all six of their paintings in a row. The other six come mixed up. Which painters go which way is decided at random when you start.',
  'After each half you say how many new paintings by those painters you expect to name right.',
  'A 45-second break, then 24 paintings you have not seen. Pick the painter for each one. No feedback until the end.',
  'Then the result: what you predicted next to what you scored, for each half.',
];

export default function InterleavingIntro() {
  const navigate = useNavigate();
  return (
    <ActivityIntro
      activity="interleaving"
      steps={STEPS}
      onStart={async () => {
        const seed = randomSeed();
        const run = await createRun('interleaving', createPlan(seed, teacherSettings()), seed);
        void navigate(`/activities/interleaving/run/${run.id}`);
        return run;
      }}
    >
      <section className="card stack">
        <h3>Before you start</h3>
        <p>
          Sit where you will not be interrupted for fifteen minutes. The paintings are made up for
          this activity, so there is nothing to look up. Watch each one and read the name. Do not
          take notes.
        </p>
      </section>
    </ActivityIntro>
  );
}
