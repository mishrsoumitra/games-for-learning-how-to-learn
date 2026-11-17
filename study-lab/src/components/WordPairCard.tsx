import type { WordPair } from '../content/swahili.ts';

interface Props {
  pair: WordPair;
  /** Show the English side as well. */
  showAnswer: boolean;
  typed?: string;
  correct?: boolean | null;
}

export function WordPairCard({ pair, showAnswer, typed, correct }: Props) {
  return (
    <div className="stack" aria-live="polite">
      <div className="cue" lang="sw">
        {pair.cue}
      </div>
      {showAnswer && <div className="cue-answer">{pair.answer}</div>}
      {typed !== undefined && correct !== undefined && correct !== null && (
        <p className={correct ? 'feedback-right' : 'feedback-wrong'}>
          {correct ? 'Right.' : typed.trim() === '' ? 'Left blank.' : `You typed "${typed}".`}
        </p>
      )}
    </div>
  );
}
