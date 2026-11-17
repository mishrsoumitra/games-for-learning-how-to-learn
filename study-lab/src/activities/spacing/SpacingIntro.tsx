import { useState } from 'react';
import { useNavigate } from 'react-router';
import { ActivityIntro } from '../../components/ActivityIntro.tsx';
import { useSettings } from '../../data/repo.ts';
import { randomSeed } from '../../lib/ids.ts';
import { createRun, teacherSettings } from '../common.ts';
import { createPlan } from './engine.ts';

export default function SpacingIntro() {
  const navigate = useNavigate();
  const settings = useSettings();
  const [curve, setCurve] = useState(settings.teacher.forgettingCurve);
  const testDay = settings.teacher.spacingTestDay;
  const steps = [
    'Two sets of 20 Swahili words. For each word you see the Swahili, type the English, then see the answer. One time through a set is one pass.',
    'The spaced set gets one pass today, one tomorrow, one the day after, and one on day 3. About five minutes each time.',
    'The crammed set gets all four passes in a row on day 3. Same number of passes, one sitting.',
    'After each session you say how many of the 20 you would get right on test day.',
    `On day ${testDay}, a test on all 40 words. Then the result.`,
    ...(curve
      ? [
          'A third set of 20 words is learned today and tested in fifths: after 10 minutes, and on days 1, 2, 4 and 7. That draws your own forgetting curve.',
        ]
      : []),
  ];
  return (
    <ActivityIntro
      activity="spacing"
      steps={steps}
      options={
        <label className="check">
          <input type="checkbox" checked={curve} onChange={(e) => setCurve(e.target.checked)} />
          <span>
            Include the forgetting curve. Adds about three minutes to most sessions and two short
            checks on days 4 and 7. Recommended.
          </span>
        </label>
      }
      onStart={async () => {
        const seed = randomSeed();
        const run = await createRun('spacing', createPlan(seed, teacherSettings(), curve), seed);
        void navigate(`/activities/spacing/run/${run.id}`);
        return run;
      }}
    >
      <section className="card stack">
        <h3>Before you start</h3>
        <p>
          This one needs you on several days. The app shows what is due on the home page and will
          not let you do a session early. If you miss a day, do the session when you can; the app
          moves the rest of the plan along and notes that it did.
        </p>
      </section>
    </ActivityIntro>
  );
}
