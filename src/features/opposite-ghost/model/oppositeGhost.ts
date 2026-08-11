export type OppositeDirection = 'left' | 'right'
export type OppositeActor = 'rabbit' | 'ghost'

export type OppositeCard = {
  actor: OppositeActor
  arrow: OppositeDirection
}

export type OppositeLevel = {
  name: string
  actor: OppositeActor | 'mixed'
}

export const OPPOSITE_LEVEL_TARGET = 4
export const OPPOSITE_TURN_TIME = 5

export const OPPOSITE_LEVELS: readonly OppositeLevel[] = [
  { name: 'うさぎを まねしよう', actor: 'rabbit' },
  { name: 'おばけと はんたい！', actor: 'ghost' },
  { name: 'まぜまぜ ゲート', actor: 'mixed' },
]

export type OppositeGhostState = {
  status: 'playing' | 'level-won' | 'finished' | 'lost'
  levelIndex: number
  currentCard: OppositeCard
  timeLeft: number
  hearts: number
  score: number
  combo: number
  bestCombo: number
  clearedInLevel: number
  totalCleared: number
}

export type OppositeGhostAction =
  | { type: 'move'; direction: OppositeDirection }
  | { type: 'tick' }
  | { type: 'next-level' }

export type OppositeGhostEvent =
  | { type: 'gate-passed'; combo: number }
  | { type: 'bumped' }
  | { type: 'timed-out' }
  | { type: 'level-won'; levelIndex: number }
  | { type: 'game-finished' }
  | { type: 'game-lost' }

export type OppositeGhostTransition = {
  state: OppositeGhostState
  events: readonly OppositeGhostEvent[]
}

export type OppositeGhostResult = {
  score: number
  totalCleared: number
  bestCombo: number
  isCleared: boolean
}

const nextDirection = (random: () => number): OppositeDirection => random() < .5 ? 'left' : 'right'

const nextCard = (levelIndex: number, random: () => number): OppositeCard => {
  const actorRule = OPPOSITE_LEVELS[levelIndex].actor
  const actor = actorRule === 'mixed' ? (random() < .5 ? 'rabbit' : 'ghost') : actorRule
  return { actor, arrow: nextDirection(random) }
}

export function expectedDirection(card: OppositeCard): OppositeDirection {
  if (card.actor === 'rabbit') return card.arrow
  return card.arrow === 'left' ? 'right' : 'left'
}

export function startOppositeGhost(random: () => number = Math.random): OppositeGhostState {
  return {
    status: 'playing',
    levelIndex: 0,
    currentCard: nextCard(0, random),
    timeLeft: OPPOSITE_TURN_TIME,
    hearts: 3,
    score: 0,
    combo: 0,
    bestCombo: 0,
    clearedInLevel: 0,
    totalCleared: 0,
  }
}

const missGate = (
  state: OppositeGhostState,
  event: 'bumped' | 'timed-out',
  random: () => number,
): OppositeGhostTransition => {
  const hearts = state.hearts - 1
  const lost = hearts <= 0
  return {
    state: {
      ...state,
      status: lost ? 'lost' : 'playing',
      currentCard: lost ? state.currentCard : nextCard(state.levelIndex, random),
      timeLeft: OPPOSITE_TURN_TIME,
      hearts: Math.max(0, hearts),
      combo: 0,
    },
    events: [
      { type: event },
      ...(lost ? [{ type: 'game-lost' } as const] : []),
    ],
  }
}

export function applyOppositeGhostAction(
  state: OppositeGhostState,
  action: OppositeGhostAction,
  random: () => number = Math.random,
): OppositeGhostTransition {
  if (action.type === 'next-level') {
    if (state.status !== 'level-won') return { state, events: [] }
    const levelIndex = state.levelIndex + 1
    return {
      state: {
        ...state,
        status: 'playing',
        levelIndex,
        currentCard: nextCard(levelIndex, random),
        timeLeft: OPPOSITE_TURN_TIME,
        clearedInLevel: 0,
      },
      events: [],
    }
  }

  if (state.status !== 'playing') return { state, events: [] }
  if (action.type === 'tick') {
    const timeLeft = state.timeLeft - 1
    return timeLeft <= 0
      ? missGate(state, 'timed-out', random)
      : { state: { ...state, timeLeft }, events: [] }
  }

  if (action.direction !== expectedDirection(state.currentCard)) {
    return missGate(state, 'bumped', random)
  }

  const combo = state.combo + 1
  const clearedInLevel = state.clearedInLevel + 1
  const totalCleared = state.totalCleared + 1
  const levelWon = clearedInLevel >= OPPOSITE_LEVEL_TARGET
  const finalLevel = state.levelIndex === OPPOSITE_LEVELS.length - 1
  const finished = levelWon && finalLevel
  return {
    state: {
      ...state,
      status: finished ? 'finished' : levelWon ? 'level-won' : 'playing',
      currentCard: levelWon ? state.currentCard : nextCard(state.levelIndex, random),
      timeLeft: OPPOSITE_TURN_TIME,
      score: state.score + 100 + state.timeLeft * 10 + (combo - 1) * 20,
      combo,
      bestCombo: Math.max(state.bestCombo, combo),
      clearedInLevel,
      totalCleared,
    },
    events: [
      { type: 'gate-passed', combo },
      ...(levelWon ? [{ type: 'level-won', levelIndex: state.levelIndex } as const] : []),
      ...(finished ? [{ type: 'game-finished' } as const] : []),
    ],
  }
}

export function calculateOppositeGhostResult(state: OppositeGhostState): OppositeGhostResult {
  if (state.status !== 'finished' && state.status !== 'lost') {
    throw new Error('ゲーム終了前は結果を計算できません')
  }
  return {
    score: state.score,
    totalCleared: state.totalCleared,
    bestCombo: state.bestCombo,
    isCleared: state.status === 'finished',
  }
}
