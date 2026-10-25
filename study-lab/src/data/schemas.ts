import { z } from 'zod';

/**
 * Every record the app stores or imports is checked against these schemas. Unknown keys are
 * dropped, strings have length limits, numbers have ranges. Imported files from other
 * people go through the same checks, so a crafted file cannot smuggle anything in.
 */

export const LIMITS = {
  shortText: 120,
  mediumText: 400,
  longText: 2000,
  tag: 40,
  tagsPerItem: 20,
  decks: 500,
  cards: 20_000,
  mnemonics: 5_000,
  runs: 2_000,
  bundleBytes: 5 * 1024 * 1024,
} as const;

const id = z.string().min(1).max(64);
const iso = z.iso.datetime({ offset: true }).or(z.iso.datetime());
const shortText = z.string().trim().max(LIMITS.shortText);
const mediumText = z.string().trim().max(LIMITS.mediumText);
const longText = z.string().trim().max(LIMITS.longText);
const tags = z.array(z.string().trim().min(1).max(LIMITS.tag)).max(LIMITS.tagsPerItem);

export const ThemeSchema = z.enum(['system', 'light', 'dark']);
export type Theme = z.infer<typeof ThemeSchema>;

export const TeacherSettingsSchema = z.object({
  allowEarlyTests: z.boolean().default(false),
  secondsPerPainting: z.number().min(1).max(6).default(3),
  artistCount: z.number().int().min(4).max(12).default(12),
  fillerSeconds: z.number().int().min(5).max(90).default(45),
  retrievalDelayDays: z.number().int().min(1).max(14).default(2),
  spacingTestDay: z.number().int().min(4).max(10).default(5),
  forgettingCurve: z.boolean().default(true),
  problemsGapDays: z.number().int().min(1).max(14).default(7),
  secondsPerPair: z.number().min(2).max(10).default(5),
});
export type TeacherSettings = z.infer<typeof TeacherSettingsSchema>;

export const SettingsSchema = z.object({
  theme: ThemeSchema.default('system'),
  participantCode: z
    .string()
    .regex(/^[A-Z0-9]{4,12}$/)
    .default('STUDENT'),
  displayName: z.string().trim().max(40).default(''),
  seenIntro: z.boolean().default(false),
  teacher: TeacherSettingsSchema.default(() => TeacherSettingsSchema.parse({})),
});
export type Settings = z.infer<typeof SettingsSchema>;

export const ReviewStateSchema = z.object({
  due: iso,
  intervalDays: z.number().min(0).max(3650).default(0),
  ease: z.number().min(1.3).max(3.5).default(2.5),
  reps: z.number().int().min(0).default(0),
  lapses: z.number().int().min(0).default(0),
  lastReviewedAt: iso.optional(),
  lastGrade: z.enum(['again', 'hard', 'good', 'easy']).optional(),
});
export type ReviewState = z.infer<typeof ReviewStateSchema>;

export const DeckSchema = z.object({
  id,
  name: shortText.min(1),
  description: mediumText.default(''),
  createdAt: iso,
  updatedAt: iso,
});
export type Deck = z.infer<typeof DeckSchema>;

export const CardSchema = z.object({
  id,
  deckId: id,
  front: longText.min(1),
  back: longText.min(1),
  hint: mediumText.default(''),
  mnemonicId: id.nullable().default(null),
  tags: tags.default([]),
  createdAt: iso,
  updatedAt: iso,
  review: ReviewStateSchema,
});
export type Card = z.infer<typeof CardSchema>;

export const MnemonicKindSchema = z.enum([
  'acronym',
  'acrostic',
  'keyword',
  'story',
  'pegs',
  'chunking',
  'other',
]);
export type MnemonicKind = z.infer<typeof MnemonicKindSchema>;

export const MnemonicSchema = z.object({
  id,
  kind: MnemonicKindSchema,
  title: shortText.min(1),
  target: longText.min(1),
  text: longText.min(1),
  notes: longText.default(''),
  tags: tags.default([]),
  createdAt: iso,
  updatedAt: iso,
  recallCount: z.number().int().min(0).default(0),
  recallCorrect: z.number().int().min(0).default(0),
  lastRecalledAt: iso.optional(),
});
export type Mnemonic = z.infer<typeof MnemonicSchema>;

export const ActivityIdSchema = z.enum(['interleaving', 'retrieval', 'spacing', 'problems']);
export type ActivityId = z.infer<typeof ActivityIdSchema>;

export const RunStatusSchema = z.enum(['in-progress', 'complete', 'abandoned']);
export type RunStatus = z.infer<typeof RunStatusSchema>;

export const ConditionResultSchema = z.object({
  key: z.string().max(40),
  label: shortText,
  /** What the student predicted, as a percentage, or null if no prediction was collected. */
  predictedPct: z.number().min(0).max(100).nullable(),
  scoredPct: z.number().min(0).max(100),
  correct: z.number().int().min(0),
  n: z.number().int().min(0),
});
export type ConditionResult = z.infer<typeof ConditionResultSchema>;

export const RunResultSchema = z.object({
  /** Two conditions. The first is the one the research says works better. */
  conditions: z.array(ConditionResultSchema).min(2).max(2),
  /** scored(first) minus scored(second), in percentage points. */
  gapPct: z.number().min(-100).max(100),
  /** predicted(first) minus predicted(second), or null. */
  predictedGapPct: z.number().min(-100).max(100).nullable(),
  honesty: z.enum(['clean', 'peeked', 'unsure']).default('clean'),
  extras: z.record(z.string().max(60), z.number()).default({}),
  summary: longText.default(''),
});
export type RunResult = z.infer<typeof RunResultSchema>;

export const RunSchema = z.object({
  id,
  activity: ActivityIdSchema,
  seed: z.number().int().min(0).max(0xffffffff),
  status: RunStatusSchema,
  startedAt: iso,
  updatedAt: iso,
  completedAt: iso.optional(),
  offSchedule: z.boolean().default(false),
  /** Activity-specific state. Each activity validates it with its own schema when loading. */
  state: z.unknown(),
  result: RunResultSchema.optional(),
});
export type Run = z.infer<typeof RunSchema>;

export const BundleSchema = z.object({
  app: z.literal('study-lab'),
  kind: z.literal('bundle'),
  version: z.literal(1),
  exportedAt: iso,
  settings: SettingsSchema.partial().optional(),
  decks: z.array(DeckSchema).max(LIMITS.decks).default([]),
  cards: z.array(CardSchema).max(LIMITS.cards).default([]),
  mnemonics: z.array(MnemonicSchema).max(LIMITS.mnemonics).default([]),
  runs: z.array(RunSchema).max(LIMITS.runs).default([]),
});
export type Bundle = z.infer<typeof BundleSchema>;

/** One student's result for one activity, the file the teacher collects for the class plot. */
export const ResultFileSchema = z.object({
  app: z.literal('study-lab'),
  kind: z.literal('result'),
  version: z.literal(1),
  participantCode: z.string().regex(/^[A-Z0-9]{4,12}$/),
  activity: ActivityIdSchema,
  completedAt: iso,
  offSchedule: z.boolean().default(false),
  result: RunResultSchema,
});
export type ResultFile = z.infer<typeof ResultFileSchema>;

/** A deck shared as a file: cards without review history. */
export const DeckFileSchema = z.object({
  app: z.literal('study-lab'),
  kind: z.literal('deck'),
  version: z.literal(1),
  name: shortText.min(1),
  description: mediumText.default(''),
  cards: z
    .array(
      z.object({
        front: longText.min(1),
        back: longText.min(1),
        hint: mediumText.default(''),
        tags: tags.default([]),
      }),
    )
    .max(LIMITS.cards),
});
export type DeckFile = z.infer<typeof DeckFileSchema>;

export function firstIssue(error: z.ZodError): string {
  const issue = error.issues[0];
  if (!issue) return 'The file did not match what the app expects.';
  const path = issue.path.length > 0 ? ` at ${issue.path.map(String).join('.')}` : '';
  return `${issue.message}${path}`;
}
