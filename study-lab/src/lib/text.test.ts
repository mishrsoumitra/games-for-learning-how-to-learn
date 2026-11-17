import { describe, expect, it } from 'vitest';
import { answerMatches, initials, levenshtein, normaliseAnswer, slugify } from './text.ts';

describe('normaliseAnswer', () => {
  it('drops case, articles, punctuation and accents', () => {
    expect(normaliseAnswer('  The Boat! ')).toBe('boat');
    expect(normaliseAnswer('a Giraffe')).toBe('giraffe');
    expect(normaliseAnswer('Café')).toBe('cafe');
    expect(normaliseAnswer('to sleep')).toBe('sleep');
  });
});

describe('answerMatches', () => {
  it('accepts exact, plural and one-letter typos on longer words', () => {
    expect(answerMatches('boat', ['boat'])).toBe(true);
    expect(answerMatches('boats', ['boat'])).toBe(true);
    expect(answerMatches('girafe', ['giraffe'])).toBe(true);
    expect(answerMatches('neighbor', ['neighbour'])).toBe(true);
  });

  it('rejects a different word and short-word typos', () => {
    expect(answerMatches('goat', ['boat'])).toBe(false);
    expect(answerMatches('ca', ['cat'])).toBe(false);
    expect(answerMatches('', ['cat'])).toBe(false);
    expect(answerMatches('cow', ['goat', 'sheep'])).toBe(false);
  });

  it('checks every accepted form', () => {
    expect(answerMatches('turtle', ['tortoise', 'turtle'])).toBe(true);
  });
});

describe('levenshtein', () => {
  it('counts edits', () => {
    expect(levenshtein('kitten', 'sitting')).toBe(3);
    expect(levenshtein('', 'abc')).toBe(3);
    expect(levenshtein('same', 'same')).toBe(0);
  });
});

describe('slugify and initials', () => {
  it('makes safe file names', () => {
    expect(slugify('My Deck: Physics (Unit 2)!')).toBe('my-deck-physics-unit-2');
    expect(slugify('   ')).toBe('untitled');
  });
  it('takes first letters', () => {
    expect(initials(['red', 'orange', 'yellow', '', 'green'])).toBe('ROYG');
  });
});
