import { useState } from 'react';
import { useNavigate } from 'react-router';
import { ActivityIntro } from '../../components/ActivityIntro.tsx';
import { useSettings } from '../../data/repo.ts';
import { randomSeed } from '../../lib/ids.ts';
import { createRun, teacherSettings } from '../common.ts';
import { createPlan } from './engine.ts';

export default function RetrievalIntro() {
  const navigate = useNavigate();
  const settings = useSettings();
  const [immediate, setImmediate] = useState(true);
  const delay = settings.teacher.retrievalDelayDays;
  const steps = [
    'You see 40 Swahili words with their English meanings, one pair at a time, five seconds each.',
    'Then three rounds of practice. In each round, 20 of the pairs are shown again for you to reread, and for the other 20 you see only the Swahili word, type the English, and then see the answer. Which words go which way is decided at random.',
    'You then say how many of each 20 you expect to remember on test day.',
    immediate
      ? 'A short test on eight extra words, right away, so you can see what a test straight after study says.'
      : 'No test today on the main words.',
    `Come back in ${delay} ${delay === 1 ? 'day' : 'days'} for the real test on all 40. Then the result.`,
  ];
  return (
    <ActivityIntro
      activity="retrieval"
      steps={steps}
      options={
        <label className="check">
          <input
            type="checkbox"
            checked={immediate}
            onChange={(e) => setImmediate(e.target.checked)}
          />
          <span>
            Include the five-minute test on eight extra words. It shows you the number that fools
            most students. Recommended.
          </span>
        </label>
      }
      onStart={async () => {
        const seed = randomSeed();
        const run = await createRun(
          'retrieval',
          createPlan(seed, teacherSettings(), immediate),
          seed,
        );
        void navigate(`/activities/retrieval/run/${run.id}`);
        return run;
      }}
    >
      <section className="card stack">
        <h3>Why Swahili?</h3>
        <p>
          Because none of you know it, so nobody has a head start on some words and not others. The
          words were chosen to avoid the ones that sound like Hindi or Urdu. Type the English
          meaning when asked; spelling is forgiven, meaning is not.
        </p>
      </section>
    </ActivityIntro>
  );
}
