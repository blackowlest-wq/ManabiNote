export const GAME_IDS = [
  'quiz',
  'stroke-order',
  'word-builder',
  'missing-character',
  'kana-pair',
  'dakuten',
  'kana-group',
  'audio-kana',
  'memory',
  'small-kana',
  'shiritori',
  'counting',
  'number-compare',
  'number-order',
  'addition',
  'subtraction',
  'clock',
  'shape-color',
  'shape-pattern',
  'kanji-reading',
  'kanji-choice',
  'sentence-order',
  'particle-choice',
  'reading-comprehension',
  'rescue-maze',
  'cooking',
  'monster-merge',
  'pipe-path',
  'shop-game',
] as const

export type GameId = typeof GAME_IDS[number]

const GAME_ID_SET = new Set<string>(GAME_IDS)

export const isGameId = (value: unknown): value is GameId =>
  typeof value === 'string' && GAME_ID_SET.has(value)
