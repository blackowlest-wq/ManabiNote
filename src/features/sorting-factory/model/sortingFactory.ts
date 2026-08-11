export type SortingSide = 'left' | 'right'

export type SortingItem = {
  id: string
  emoji: string
  side: SortingSide
}

export type SortingLevel = {
  name: string
  leftLabel: string
  leftEmoji: string
  rightLabel: string
  rightEmoji: string
  items: readonly SortingItem[]
}

export const SORTING_LEVEL_TARGET = 4
export const SORTING_BELT_END = 5

export const SORTING_LEVELS: readonly SortingLevel[] = [
  {
    name: 'たべものと どうぶつ',
    leftLabel: 'たべもの',
    leftEmoji: '🍎',
    rightLabel: 'どうぶつ',
    rightEmoji: '🐶',
    items: [
      { id: 'apple', emoji: '🍎', side: 'left' },
      { id: 'banana', emoji: '🍌', side: 'left' },
      { id: 'grape', emoji: '🍇', side: 'left' },
      { id: 'dog', emoji: '🐶', side: 'right' },
      { id: 'cat', emoji: '🐱', side: 'right' },
      { id: 'rabbit', emoji: '🐰', side: 'right' },
    ],
  },
  {
    name: 'そらと うみ',
    leftLabel: 'そら',
    leftEmoji: '☁️',
    rightLabel: 'うみ',
    rightEmoji: '🌊',
    items: [
      { id: 'bird', emoji: '🐦', side: 'left' },
      { id: 'butterfly', emoji: '🦋', side: 'left' },
      { id: 'helicopter', emoji: '🚁', side: 'left' },
      { id: 'fish', emoji: '🐟', side: 'right' },
      { id: 'octopus', emoji: '🐙', side: 'right' },
      { id: 'whale', emoji: '🐳', side: 'right' },
    ],
  },
  {
    name: 'あついと つめたい',
    leftLabel: 'あつい',
    leftEmoji: '🔥',
    rightLabel: 'つめたい',
    rightEmoji: '❄️',
    items: [
      { id: 'sun', emoji: '☀️', side: 'left' },
      { id: 'soup', emoji: '🍲', side: 'left' },
      { id: 'fire', emoji: '🔥', side: 'left' },
      { id: 'snowman', emoji: '⛄', side: 'right' },
      { id: 'ice', emoji: '🧊', side: 'right' },
      { id: 'icecream', emoji: '🍦', side: 'right' },
    ],
  },
  {
    name: 'じめんと みず',
    leftLabel: 'じめん', leftEmoji: '🌳', rightLabel: 'みず', rightEmoji: '🌊',
    items: [
      { id: 'ground-car', emoji: '🚗', side: 'left' }, { id: 'ground-bike', emoji: '🚲', side: 'left' }, { id: 'ground-train', emoji: '🚂', side: 'left' },
      { id: 'water-fish', emoji: '🐟', side: 'right' }, { id: 'water-boat', emoji: '⛵', side: 'right' }, { id: 'water-dolphin', emoji: '🐬', side: 'right' },
    ],
  },
  {
    name: 'あかと きいろ',
    leftLabel: 'あか', leftEmoji: '🔴', rightLabel: 'きいろ', rightEmoji: '🟡',
    items: [
      { id: 'red-apple', emoji: '🍎', side: 'left' }, { id: 'red-strawberry', emoji: '🍓', side: 'left' }, { id: 'red-cherry', emoji: '🍒', side: 'left' },
      { id: 'yellow-banana', emoji: '🍌', side: 'right' }, { id: 'yellow-lemon', emoji: '🍋', side: 'right' }, { id: 'yellow-chick', emoji: '🐥', side: 'right' },
    ],
  },
  {
    name: 'おおきいと ちいさい',
    leftLabel: 'おおきい', leftEmoji: '🐘', rightLabel: 'ちいさい', rightEmoji: '🐜',
    items: [
      { id: 'big-elephant', emoji: '🐘', side: 'left' }, { id: 'big-whale', emoji: '🐳', side: 'left' }, { id: 'big-giraffe', emoji: '🦒', side: 'left' },
      { id: 'small-ant', emoji: '🐜', side: 'right' }, { id: 'small-mouse', emoji: '🐭', side: 'right' }, { id: 'small-ladybug', emoji: '🐞', side: 'right' },
    ],
  },
  {
    name: 'まると しかく',
    leftLabel: 'まる', leftEmoji: '⚽', rightLabel: 'しかく', rightEmoji: '🎁',
    items: [
      { id: 'round-ball', emoji: '⚽', side: 'left' }, { id: 'round-orange', emoji: '🍊', side: 'left' }, { id: 'round-moon', emoji: '🌕', side: 'left' },
      { id: 'square-gift', emoji: '🎁', side: 'right' }, { id: 'square-book', emoji: '📕', side: 'right' }, { id: 'square-frame', emoji: '🖼️', side: 'right' },
    ],
  },
  {
    name: 'そとと おうち',
    leftLabel: 'そと', leftEmoji: '🌳', rightLabel: 'おうち', rightEmoji: '🏠',
    items: [
      { id: 'outside-tree', emoji: '🌳', side: 'left' }, { id: 'outside-flower', emoji: '🌷', side: 'left' }, { id: 'outside-rainbow', emoji: '🌈', side: 'left' },
      { id: 'inside-bed', emoji: '🛏️', side: 'right' }, { id: 'inside-chair', emoji: '🪑', side: 'right' }, { id: 'inside-bath', emoji: '🛁', side: 'right' },
    ],
  },
  {
    name: 'あさと よる',
    leftLabel: 'あさ', leftEmoji: '🌅', rightLabel: 'よる', rightEmoji: '🌙',
    items: [
      { id: 'morning-sunrise', emoji: '🌅', side: 'left' }, { id: 'morning-rooster', emoji: '🐓', side: 'left' }, { id: 'morning-bread', emoji: '🍞', side: 'left' },
      { id: 'night-moon', emoji: '🌙', side: 'right' }, { id: 'night-owl', emoji: '🦉', side: 'right' }, { id: 'night-star', emoji: '⭐', side: 'right' },
    ],
  },
  {
    name: 'やさいと くだもの',
    leftLabel: 'やさい', leftEmoji: '🥕', rightLabel: 'くだもの', rightEmoji: '🍎',
    items: [
      { id: 'veg-carrot', emoji: '🥕', side: 'left' }, { id: 'veg-broccoli', emoji: '🥦', side: 'left' }, { id: 'veg-corn', emoji: '🌽', side: 'left' },
      { id: 'fruit-apple', emoji: '🍎', side: 'right' }, { id: 'fruit-grape', emoji: '🍇', side: 'right' }, { id: 'fruit-peach', emoji: '🍑', side: 'right' },
    ],
  },
  {
    name: 'のりものと がっき',
    leftLabel: 'のりもの', leftEmoji: '🚗', rightLabel: 'がっき', rightEmoji: '🎵',
    items: [
      { id: 'vehicle-car', emoji: '🚗', side: 'left' }, { id: 'vehicle-train', emoji: '🚆', side: 'left' }, { id: 'vehicle-plane', emoji: '✈️', side: 'left' },
      { id: 'music-guitar', emoji: '🎸', side: 'right' }, { id: 'music-piano', emoji: '🎹', side: 'right' }, { id: 'music-drum', emoji: '🥁', side: 'right' },
    ],
  },
  {
    name: 'はると ふゆ',
    leftLabel: 'はる', leftEmoji: '🌸', rightLabel: 'ふゆ', rightEmoji: '⛄',
    items: [
      { id: 'spring-cherry', emoji: '🌸', side: 'left' }, { id: 'spring-butterfly', emoji: '🦋', side: 'left' }, { id: 'spring-tulip', emoji: '🌷', side: 'left' },
      { id: 'winter-snowman', emoji: '⛄', side: 'right' }, { id: 'winter-snow', emoji: '❄️', side: 'right' }, { id: 'winter-ski', emoji: '🎿', side: 'right' },
    ],
  },
]

export type SortingFactoryState = {
  status: 'playing' | 'level-won' | 'finished' | 'lost'
  levelIndex: number
  currentItemId: string
  itemPosition: number
  hearts: number
  score: number
  combo: number
  bestCombo: number
  sortedInLevel: number
  totalSorted: number
  missedCount: number
}

export type SortingFactoryAction =
  | { type: 'sort'; side: SortingSide }
  | { type: 'tick' }
  | { type: 'next-level' }

export type SortingFactoryEvent =
  | { type: 'item-sorted'; itemId: string; combo: number }
  | { type: 'item-dropped'; itemId: string }
  | { type: 'item-missed'; itemId: string }
  | { type: 'level-won'; levelIndex: number }
  | { type: 'game-finished' }
  | { type: 'game-lost' }

export type SortingFactoryTransition = {
  state: SortingFactoryState
  events: readonly SortingFactoryEvent[]
}

export type SortingFactoryResult = {
  score: number
  totalSorted: number
  bestCombo: number
  isCleared: boolean
}

const randomItemId = (levelIndex: number, random: () => number) => {
  const items = SORTING_LEVELS[levelIndex].items
  const index = Math.floor(Math.min(Math.max(random(), 0), 0.999999) * items.length)
  return items[index].id
}

export function startSortingFactory(random: () => number = Math.random): SortingFactoryState {
  return {
    status: 'playing',
    levelIndex: 0,
    currentItemId: randomItemId(0, random),
    itemPosition: 0,
    hearts: 3,
    score: 0,
    combo: 0,
    bestCombo: 0,
    sortedInLevel: 0,
    totalSorted: 0,
    missedCount: 0,
  }
}

const dropCurrent = (
  state: SortingFactoryState,
  eventType: 'item-dropped' | 'item-missed',
  random: () => number,
): SortingFactoryTransition => {
  const hearts = state.hearts - 1
  const lost = hearts <= 0
  return {
    state: {
      ...state,
      status: lost ? 'lost' : 'playing',
      currentItemId: lost ? state.currentItemId : randomItemId(state.levelIndex, random),
      itemPosition: 0,
      hearts: Math.max(0, hearts),
      combo: 0,
      missedCount: state.missedCount + 1,
    },
    events: [
      { type: eventType, itemId: state.currentItemId },
      ...(lost ? [{ type: 'game-lost' } as const] : []),
    ],
  }
}

export function applySortingFactoryAction(
  state: SortingFactoryState,
  action: SortingFactoryAction,
  random: () => number = Math.random,
): SortingFactoryTransition {
  if (action.type === 'next-level') {
    if (state.status !== 'level-won') return { state, events: [] }
    const levelIndex = state.levelIndex + 1
    return {
      state: {
        ...state,
        status: 'playing',
        levelIndex,
        currentItemId: randomItemId(levelIndex, random),
        itemPosition: 0,
        sortedInLevel: 0,
      },
      events: [],
    }
  }

  if (state.status !== 'playing') return { state, events: [] }

  if (action.type === 'tick') {
    const itemPosition = state.itemPosition + 1
    return itemPosition > SORTING_BELT_END
      ? dropCurrent(state, 'item-missed', random)
      : { state: { ...state, itemPosition }, events: [] }
  }

  const level = SORTING_LEVELS[state.levelIndex]
  const item = level.items.find(({ id }) => id === state.currentItemId)
  if (!item || item.side !== action.side) return dropCurrent(state, 'item-dropped', random)

  const combo = state.combo + 1
  const sortedInLevel = state.sortedInLevel + 1
  const totalSorted = state.totalSorted + 1
  const levelWon = sortedInLevel >= SORTING_LEVEL_TARGET
  const finalLevel = state.levelIndex === SORTING_LEVELS.length - 1
  const finished = levelWon && finalLevel
  return {
    state: {
      ...state,
      status: finished ? 'finished' : levelWon ? 'level-won' : 'playing',
      currentItemId: levelWon ? state.currentItemId : randomItemId(state.levelIndex, random),
      itemPosition: 0,
      score: state.score + 100 + (combo - 1) * 20,
      combo,
      bestCombo: Math.max(state.bestCombo, combo),
      sortedInLevel,
      totalSorted,
    },
    events: [
      { type: 'item-sorted', itemId: state.currentItemId, combo },
      ...(levelWon ? [{ type: 'level-won', levelIndex: state.levelIndex } as const] : []),
      ...(finished ? [{ type: 'game-finished' } as const] : []),
    ],
  }
}

export function calculateSortingFactoryResult(state: SortingFactoryState): SortingFactoryResult {
  if (state.status !== 'finished' && state.status !== 'lost') {
    throw new Error('ゲーム終了前は結果を計算できません')
  }
  return {
    score: state.score,
    totalSorted: state.totalSorted,
    bestCombo: state.bestCombo,
    isCleared: state.status === 'finished',
  }
}
