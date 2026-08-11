export type BalanceSide = 'left' | 'right'

export type BalanceLevel = {
  name: string
  target: number
  maxWeight: number
  tiltLimit: number
  water: string
}

export const BALANCE_LEVELS: readonly BalanceLevel[] = [
  { name: 'しずかな みなと', target: 4, maxWeight: 2, tiltLimit: 3, water: 'おだやか' },
  { name: 'なみの みなと', target: 5, maxWeight: 3, tiltLimit: 3, water: 'なみなみ' },
  { name: 'かぜの みなと', target: 6, maxWeight: 3, tiltLimit: 2, water: 'びゅうびゅう' },
]

export type BalanceBoatState = {
  status: 'playing' | 'level-won' | 'finished' | 'lost'
  levelIndex: number
  currentWeight: number
  leftWeight: number
  rightWeight: number
  hearts: number
  score: number
  combo: number
  bestCombo: number
  deliveredInLevel: number
  totalDelivered: number
  tippedCount: number
}

export type BalanceBoatAction =
  | { type: 'place'; side: BalanceSide }
  | { type: 'next-level' }

export type BalanceBoatEvent =
  | { type: 'parcel-placed'; side: BalanceSide; weight: number }
  | { type: 'boat-balanced'; combo: number }
  | { type: 'boat-tipped' }
  | { type: 'level-won'; levelIndex: number }
  | { type: 'game-finished' }
  | { type: 'game-lost' }

export type BalanceBoatTransition = {
  state: BalanceBoatState
  events: readonly BalanceBoatEvent[]
}

export type BalanceBoatResult = {
  score: number
  totalDelivered: number
  bestCombo: number
  isCleared: boolean
}

const randomWeight = (levelIndex: number, random: () => number) => {
  const maxWeight = BALANCE_LEVELS[levelIndex].maxWeight
  return Math.floor(Math.min(Math.max(random(), 0), 0.999999) * maxWeight) + 1
}

export function startBalanceBoat(random: () => number = Math.random): BalanceBoatState {
  return {
    status: 'playing',
    levelIndex: 0,
    currentWeight: randomWeight(0, random),
    leftWeight: 0,
    rightWeight: 0,
    hearts: 3,
    score: 0,
    combo: 0,
    bestCombo: 0,
    deliveredInLevel: 0,
    totalDelivered: 0,
    tippedCount: 0,
  }
}

export function applyBalanceBoatAction(
  state: BalanceBoatState,
  action: BalanceBoatAction,
  random: () => number = Math.random,
): BalanceBoatTransition {
  if (action.type === 'next-level') {
    if (state.status !== 'level-won') return { state, events: [] }
    const levelIndex = state.levelIndex + 1
    return {
      state: {
        ...state,
        status: 'playing',
        levelIndex,
        currentWeight: randomWeight(levelIndex, random),
        leftWeight: 0,
        rightWeight: 0,
        deliveredInLevel: 0,
      },
      events: [],
    }
  }

  if (state.status !== 'playing') return { state, events: [] }
  const level = BALANCE_LEVELS[state.levelIndex]
  const leftWeight = state.leftWeight + (action.side === 'left' ? state.currentWeight : 0)
  const rightWeight = state.rightWeight + (action.side === 'right' ? state.currentWeight : 0)
  const tilt = Math.abs(leftWeight - rightWeight)

  if (tilt > level.tiltLimit) {
    const hearts = state.hearts - 1
    const lost = hearts <= 0
    return {
      state: {
        ...state,
        status: lost ? 'lost' : 'playing',
        currentWeight: lost ? state.currentWeight : randomWeight(state.levelIndex, random),
        leftWeight: 0,
        rightWeight: 0,
        hearts: Math.max(0, hearts),
        combo: 0,
        tippedCount: state.tippedCount + 1,
      },
      events: [
        { type: 'boat-tipped' },
        ...(lost ? [{ type: 'game-lost' } as const] : []),
      ],
    }
  }

  const balanced = leftWeight > 0 && leftWeight === rightWeight
  const combo = balanced ? state.combo + 1 : state.combo
  const deliveredInLevel = state.deliveredInLevel + 1
  const totalDelivered = state.totalDelivered + 1
  const levelWon = deliveredInLevel >= level.target
  const finalLevel = state.levelIndex === BALANCE_LEVELS.length - 1
  const finished = levelWon && finalLevel
  return {
    state: {
      ...state,
      status: finished ? 'finished' : levelWon ? 'level-won' : 'playing',
      currentWeight: levelWon ? state.currentWeight : randomWeight(state.levelIndex, random),
      leftWeight: balanced ? 0 : leftWeight,
      rightWeight: balanced ? 0 : rightWeight,
      score: state.score + 100 + (balanced ? 100 * combo : 0),
      combo,
      bestCombo: Math.max(state.bestCombo, combo),
      deliveredInLevel,
      totalDelivered,
    },
    events: [
      { type: 'parcel-placed', side: action.side, weight: state.currentWeight },
      ...(balanced ? [{ type: 'boat-balanced', combo } as const] : []),
      ...(levelWon ? [{ type: 'level-won', levelIndex: state.levelIndex } as const] : []),
      ...(finished ? [{ type: 'game-finished' } as const] : []),
    ],
  }
}

export function calculateBalanceBoatResult(state: BalanceBoatState): BalanceBoatResult {
  if (state.status !== 'finished' && state.status !== 'lost') {
    throw new Error('ゲーム終了前は結果を計算できません')
  }
  return {
    score: state.score,
    totalDelivered: state.totalDelivered,
    bestCombo: state.bestCombo,
    isCleared: state.status === 'finished',
  }
}
