import type { MnemonicKind } from '../../data/schemas.ts';

export interface KindInfo {
  kind: MnemonicKind;
  name: string;
  what: string;
  example: string;
  targetLabel: string;
  textLabel: string;
}

export const KINDS: readonly KindInfo[] = [
  {
    kind: 'acronym',
    name: 'Acronym',
    what: 'Take the first letter of each item and make a word you can say.',
    example: 'VIBGYOR for the colours of the rainbow. BODMAS for the order of operations.',
    targetLabel: 'The list to remember, one item per line, in order',
    textLabel: 'The acronym',
  },
  {
    kind: 'acrostic',
    name: 'Sentence from first letters',
    what: 'Take the first letter of each item and make a sentence whose words start with those letters.',
    example: '"My Very Educated Mother Just Served Us Noodles" for the planets in order.',
    targetLabel: 'The list to remember, one item per line, in order',
    textLabel: 'The sentence',
  },
  {
    kind: 'keyword',
    name: 'Keyword and picture',
    what: 'For a foreign word or a technical term: find an ordinary word that sounds like it, then picture that word doing something with the meaning.',
    example: 'Swahili "mbwa" (dog): sounds like "boo-ah", picture a dog saying boo to scare you.',
    targetLabel: 'The word or term, and what it means',
    textLabel: 'The sound-alike word and the picture',
  },
  {
    kind: 'story',
    name: 'Story or walk',
    what: 'Link the items into one story, or place them one by one along a walk you know (your room, the mess, the way to class).',
    example:
      'To remember the steps of a proof, put each step at a spot along the corridor to the lab.',
    targetLabel: 'The items, in order',
    textLabel: 'The story, or the walk with each item at its spot',
  },
  {
    kind: 'pegs',
    name: 'Number pegs',
    what: 'Fix a picture to each number (one is a bun, two is a shoe, three is a tree, four is a door, five is a hive, six is sticks, seven is heaven, eight is a gate, nine is wine, ten is a hen), then picture each item with its number’s peg.',
    example: 'Item 2 is "momentum": a shoe with a huge momentum crashing through the wall.',
    targetLabel: 'The numbered items',
    textLabel: 'Each number’s picture with its item',
  },
  {
    kind: 'chunking',
    name: 'Chunking',
    what: 'Break a long string into groups you can hold. Phone numbers, constants, dates, a long formula.',
    example:
      '299792458 becomes 299 · 792 · 458, and each group gets a reading: "nearly 300, 792, 458".',
    targetLabel: 'The long thing to remember',
    textLabel: 'The groups and how you read each one',
  },
  {
    kind: 'other',
    name: 'Something else',
    what: 'A rhyme, a drawing, a gesture, whatever hooks it for you.',
    example: '"i before e except after c".',
    targetLabel: 'What to remember',
    textLabel: 'The mnemonic',
  },
];

export function kindInfo(kind: MnemonicKind): KindInfo {
  return KINDS.find((k) => k.kind === kind) ?? (KINDS[KINDS.length - 1] as KindInfo);
}

export const PEGS = [
  'bun',
  'shoe',
  'tree',
  'door',
  'hive',
  'sticks',
  'heaven',
  'gate',
  'wine',
  'hen',
];

/** Splits a digit string into groups of three or four, longest groups first where it helps. */
export function chunkDigits(input: string, size = 3): string[] {
  const digits = input.replace(/\D/g, '');
  if (digits === '') return [];
  const out: string[] = [];
  for (let i = 0; i < digits.length; i += size) out.push(digits.slice(i, i + size));
  return out;
}
