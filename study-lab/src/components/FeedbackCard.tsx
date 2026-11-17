import type { WordPair } from '../content/swahili.ts';
import { useCountdown } from './useTicker.ts';
import { WordPairCard } from './WordPairCard.tsx';

export interface Feedback {
  pair: WordPair;
  typed: string;
  correct: boolean;
  key: string;
}

interface Props {
  feedback: Feedback;
  seconds: number;
  onDone: () => void;
}

/** Shows the right answer for a few seconds after a typed attempt, then calls onDone. */
export function FeedbackCard({ feedback, seconds, onDone }: Props) {
  useCountdown(seconds, onDone, feedback.key);
  return (
    <WordPairCard
      pair={feedback.pair}
      showAnswer
      typed={feedback.typed}
      correct={feedback.correct}
    />
  );
}
