export type TreasureDirection =
  | 'up'
  | 'up-right'
  | 'right'
  | 'down-right'
  | 'down'
  | 'down-left'
  | 'left'
  | 'up-left'

export type TreasureWarmth = 'hot' | 'warm' | 'cold'

export type TreasureClue = {
  index: number
  distance: number
  direction: TreasureDirection
  warmth: TreasureWarmth
}

export type TreasureRound = {
  size: number
  maxDigs: number
  name: string
}

export type TreasureHuntState = {
  status: 'playing' | 'round-won' | 'round-lost' | 'finished'
  roundIndex: number
  treasureIndex: number
  dugCells: readonly TreasureClue[]
  digsLeft: number
  foundCount: number
  score: number
  combo: number
  bestCombo: number
}

export type TreasureHuntAction = { type: 'dig'; index: number } | { type: 'next-round' }

export type TreasureHuntEvent =
  | { type: 'clue-found'; direction: TreasureDirection; warmth: TreasureWarmth }
  | { type: 'treasure-found' }
  | { type: 'round-lost' }
  | { type: 'game-finished' }

export type TreasureHuntTransition = {
  state: TreasureHuntState
  events: readonly TreasureHuntEvent[]
}

export type TreasureHuntResult = {
  foundCount: number
  score: number
  bestCombo: number
  isCleared: boolean
}

export const TREASURE_CLEAR_TARGET = 2

export const TREASURE_ROUNDS: readonly TreasureRound[] = [
  { size: 4, maxDigs: 6, name: 'ちいさな しま' },
  { size: 5, maxDigs: 7, name: 'みどりの しま' },
  { size: 6, maxDigs: 8, name: 'かいぞくの しま' },
]

const randomTreasureIndex = (round: TreasureRound, random: () => number) =>
  Math.floor(Math.min(Math.max(random(), 0), 0.999999) * round.size * round.size)

export function startTreasureHunt(random: () => number = Math.random): TreasureHuntState {
  const round = TREASURE_ROUNDS[0]
  return {
    status: 'playing',
    roundIndex: 0,
    treasureIndex: randomTreasureIndex(round, random),
    dugCells: [],
    digsLeft: round.maxDigs,
    foundCount: 0,
    score: 0,
    combo: 0,
    bestCombo: 0,
  }
}

const clueFor = (round: TreasureRound, treasureIndex: number, index: number): TreasureClue => {
  const treasureRow = Math.floor(treasureIndex / round.size)
  const treasureColumn = treasureIndex % round.size
  const row = Math.floor(index / round.size)
  const column = index % round.size
  const vertical = treasureRow < row ? 'up' : treasureRow > row ? 'down' : ''
  const horizontal = treasureColumn < column ? 'left' : treasureColumn > column ? 'right' : ''
  const direction = (vertical && horizontal ? `${vertical}-${horizontal}` : vertical || horizontal) as TreasureDirection
  const distance = Math.abs(treasureRow - row) + Math.abs(treasureColumn - column)
  const warmth: TreasureWarmth = distance <= 2 ? 'hot' : distance <= 4 ? 'warm' : 'cold'
  return { index, distance, direction, warmth }
}

export function applyTreasureAction(
  state: TreasureHuntState,
  action: TreasureHuntAction,
  random: () => number = Math.random,
): TreasureHuntTransition {
  if (action.type === 'next-round') {
    if (state.status !== 'round-won' && state.status !== 'round-lost') return { state, events: [] }
    const nextRoundIndex = state.roundIndex + 1
    const nextRound = TREASURE_ROUNDS[nextRoundIndex]
    if (!nextRound) {
      return { state: { ...state, status: 'finished' }, events: [{ type: 'game-finished' }] }
    }
    return {
      state: {
        ...state,
        status: 'playing',
        roundIndex: nextRoundIndex,
        treasureIndex: randomTreasureIndex(nextRound, random),
        dugCells: [],
        digsLeft: nextRound.maxDigs,
      },
      events: [],
    }
  }

  if (state.status !== 'playing') return { state, events: [] }
  const round = TREASURE_ROUNDS[state.roundIndex]
  if (action.index < 0 || action.index >= round.size * round.size) return { state, events: [] }
  if (state.dugCells.some((clue) => clue.index === action.index)) return { state, events: [] }

  if (action.index === state.treasureIndex) {
    const combo = state.combo + 1
    return {
      state: {
        ...state,
        status: 'round-won',
        foundCount: state.foundCount + 1,
        combo,
        bestCombo: Math.max(state.bestCombo, combo),
        score: state.score + 100 * combo + state.digsLeft * 20,
      },
      events: [{ type: 'treasure-found' }],
    }
  }

  const clue = clueFor(round, state.treasureIndex, action.index)
  const digsLeft = state.digsLeft - 1
  if (digsLeft <= 0) {
    return {
      state: { ...state, status: 'round-lost', dugCells: [...state.dugCells, clue], digsLeft: 0, combo: 0 },
      events: [
        { type: 'clue-found', direction: clue.direction, warmth: clue.warmth },
        { type: 'round-lost' },
      ],
    }
  }
  return {
    state: { ...state, dugCells: [...state.dugCells, clue], digsLeft },
    events: [{ type: 'clue-found', direction: clue.direction, warmth: clue.warmth }],
  }
}

export function calculateTreasureResult(state: TreasureHuntState): TreasureHuntResult {
  if (state.status !== 'finished') throw new Error('ゲーム終了前は結果を計算できません')
  return {
    foundCount: state.foundCount,
    score: state.score,
    bestCombo: state.bestCombo,
    isCleared: state.foundCount >= TREASURE_CLEAR_TARGET,
  }
}
