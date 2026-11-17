interface Props {
  onAnswer: (value: 'clean' | 'peeked' | 'unsure') => void;
}

/**
 * Asked after every delayed test. Nobody is marked on it. A run where the student looked at
 * the words in between is simply left out of the class plot, so the plot stays honest.
 */
export function HonestyQuestion({ onAnswer }: Props) {
  return (
    <div className="stack" style={{ maxWidth: 560 }}>
      <h2>One last question</h2>
      <p>
        Between the study session and this test, did you look at the words anywhere, or practise
        them on your own? Be straight: nothing depends on the answer except whether your run goes
        into the class plot.
      </p>
      <div className="btn-group">
        <button type="button" className="btn" onClick={() => onAnswer('clean')}>
          No, I did not look at them
        </button>
        <button type="button" className="btn btn-secondary" onClick={() => onAnswer('peeked')}>
          Yes, I looked or practised
        </button>
        <button type="button" className="btn btn-secondary" onClick={() => onAnswer('unsure')}>
          Not sure
        </button>
      </div>
    </div>
  );
}
