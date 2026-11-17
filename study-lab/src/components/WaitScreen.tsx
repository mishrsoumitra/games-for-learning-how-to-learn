import { Link } from 'react-router';
import { dateForDay, formatDate } from '../lib/dates.ts';

interface Props {
  startedAt: string;
  dueDay: number;
  today: number;
  what: string;
  /** Extra line about the ten-minute wait, when that is what is being waited for. */
  waitMinutes?: number;
}

/** Shown when the next part of a run is not open yet. */
export function WaitScreen({ startedAt, dueDay, today, what, waitMinutes = 0 }: Props) {
  const date = dateForDay(startedAt, dueDay);
  const days = dueDay - today;
  return (
    <section className="card stack">
      <h2>Come back for {what}</h2>
      {waitMinutes > 0 ? (
        <p>
          The next check opens in about {waitMinutes} {waitMinutes === 1 ? 'minute' : 'minutes'}.
          Leave this page open or come back to it. Meanwhile you can review your flashcards or write
          a mnemonic.
        </p>
      ) : (
        <p>
          It opens on {formatDate(date)}, {days === 1 ? 'tomorrow' : `in ${days} days`}. The gap is
          the point of the activity, so the app will not let you go early. A night's sleep in
          between is part of the design.
        </p>
      )}
      <p className="small muted">
        Until then, do not look at the words anywhere. If you do, say so when the app asks, and your
        run will be kept out of the class plot.
      </p>
      <div className="btn-group">
        <Link className="btn btn-secondary" to="/">
          Back to the home page
        </Link>
        <Link className="btn btn-secondary" to="/flashcards">
          Review flashcards instead
        </Link>
      </div>
    </section>
  );
}
