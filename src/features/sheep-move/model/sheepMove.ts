export type SheepPosition = { row: number; column: number }
export type SheepDirection = 'up' | 'down' | 'left' | 'right'

export type SheepStage = {
  name: string
  size: number
  player: SheepPosition
  sheep: readonly SheepPosition[]
  goals: readonly SheepPosition[]
  walls: readonly SheepPosition[]
  solution: readonly SheepDirection[]
}

export const SHEEP_STAGES: readonly SheepStage[] = [
  {
    name: 'まっすぐ おうちへ', size: 5,
    player: { row: 2, column: 0 }, sheep: [{ row: 2, column: 2 }], goals: [{ row: 2, column: 4 }], walls: [],
    solution: ['right', 'right', 'right'],
  },
  {
    name: 'ふたりの ひつじ', size: 5,
    player: { row: 2, column: 0 }, sheep: [{ row: 1, column: 2 }, { row: 3, column: 2 }], goals: [{ row: 1, column: 4 }, { row: 3, column: 4 }], walls: [],
    solution: ['up', 'right', 'right', 'right', 'left', 'left', 'down', 'down', 'right', 'right'],
  },
  {
    name: 'いわの あいだ', size: 5,
    player: { row: 4, column: 0 }, sheep: [{ row: 2, column: 2 }], goals: [{ row: 0, column: 2 }],
    walls: [{ row: 2, column: 1 }, { row: 2, column: 3 }],
    solution: ['up', 'right', 'right', 'up', 'up'],
  },
  {
    name: 'まがって おうちへ', size: 5,
    player: { row: 0, column: 2 }, sheep: [{ row: 2, column: 2 }], goals: [{ row: 4, column: 4 }],
    walls: [{ row: 0, column: 0 }, { row: 0, column: 4 }],
    solution: ['down', 'down', 'down', 'left', 'down', 'right', 'right'],
  },
  {
    name: 'いわと ふたり', size: 5,
    player: { row: 2, column: 0 }, sheep: [{ row: 1, column: 2 }, { row: 3, column: 2 }], goals: [{ row: 1, column: 4 }, { row: 3, column: 4 }],
    walls: [{ row: 2, column: 2 }, { row: 0, column: 3 }, { row: 4, column: 3 }],
    solution: ['up', 'right', 'right', 'right', 'left', 'left', 'down', 'down', 'right', 'right'],
  },
  {
    name: 'みんなで おひっこし', size: 5,
    player: { row: 2, column: 0 },
    sheep: [{ row: 0, column: 2 }, { row: 2, column: 2 }, { row: 4, column: 2 }],
    goals: [{ row: 0, column: 4 }, { row: 2, column: 4 }, { row: 4, column: 4 }],
    walls: [{ row: 1, column: 3 }, { row: 3, column: 3 }],
    solution: ['right', 'right', 'right', 'left', 'left', 'up', 'up', 'right', 'right', 'left', 'left', 'down', 'down', 'down', 'down', 'right', 'right'],
  },
  {
    name: 'たてみち おうちへ', size: 5,
    player: { row: 0, column: 2 }, sheep: [{ row: 2, column: 2 }], goals: [{ row: 4, column: 2 }], walls: [],
    solution: ['down', 'down', 'down'],
  },
  {
    name: 'たてならびの ふたり', size: 5,
    player: { row: 0, column: 2 }, sheep: [{ row: 2, column: 3 }, { row: 2, column: 1 }], goals: [{ row: 4, column: 3 }, { row: 4, column: 1 }], walls: [],
    solution: ['right', 'down', 'down', 'down', 'up', 'up', 'left', 'left', 'down', 'down'],
  },
  {
    name: 'よこいわの あいだ', size: 5,
    player: { row: 0, column: 0 }, sheep: [{ row: 2, column: 2 }], goals: [{ row: 2, column: 4 }],
    walls: [{ row: 1, column: 2 }, { row: 3, column: 2 }],
    solution: ['right', 'down', 'down', 'right', 'right'],
  },
  {
    name: 'ぐるりと おうちへ', size: 5,
    player: { row: 2, column: 4 }, sheep: [{ row: 2, column: 2 }], goals: [{ row: 4, column: 0 }],
    walls: [{ row: 0, column: 4 }, { row: 4, column: 4 }],
    solution: ['left', 'left', 'left', 'up', 'left', 'down', 'down'],
  },
  {
    name: 'よこいわと ふたり', size: 5,
    player: { row: 0, column: 2 }, sheep: [{ row: 2, column: 3 }, { row: 2, column: 1 }], goals: [{ row: 4, column: 3 }, { row: 4, column: 1 }],
    walls: [{ row: 2, column: 2 }, { row: 3, column: 4 }, { row: 3, column: 0 }],
    solution: ['right', 'down', 'down', 'down', 'up', 'up', 'left', 'left', 'down', 'down'],
  },
  {
    name: 'ひつじの だいパレード', size: 5,
    player: { row: 0, column: 2 },
    sheep: [{ row: 2, column: 4 }, { row: 2, column: 2 }, { row: 2, column: 0 }],
    goals: [{ row: 4, column: 4 }, { row: 4, column: 2 }, { row: 4, column: 0 }],
    walls: [{ row: 3, column: 3 }, { row: 3, column: 1 }],
    solution: ['down', 'down', 'down', 'up', 'up', 'right', 'right', 'down', 'down', 'up', 'up', 'left', 'left', 'left', 'left', 'down', 'down'],
  },
]

type SheepSnapshot = {
  player: SheepPosition
  sheep: readonly SheepPosition[]
  moveCount: number
}

export type SheepMoveState = {
  status: 'playing' | 'stage-won' | 'finished'
  stageIndex: number
  player: SheepPosition
  sheep: readonly SheepPosition[]
  moveCount: number
  stageStars: number
  totalStars: number
  score: number
  history: readonly SheepSnapshot[]
}

export type SheepMoveAction =
  | { type: 'move'; direction: SheepDirection }
  | { type: 'undo' }
  | { type: 'reset-stage' }
  | { type: 'next-stage' }

export type SheepMoveEvent =
  | { type: 'player-moved' }
  | { type: 'sheep-pushed' }
  | { type: 'blocked' }
  | { type: 'stage-won'; stars: number }
  | { type: 'game-finished' }

export type SheepMoveTransition = {
  state: SheepMoveState
  events: readonly SheepMoveEvent[]
}

export type SheepMoveResult = {
  score: number
  totalStars: number
  isCleared: boolean
}

const samePosition = (left: SheepPosition, right: SheepPosition) =>
  left.row === right.row && left.column === right.column

const vectorFor: Readonly<Record<SheepDirection, SheepPosition>> = {
  up: { row: -1, column: 0 },
  down: { row: 1, column: 0 },
  left: { row: 0, column: -1 },
  right: { row: 0, column: 1 },
}

export function startSheepMove(stageIndex = 0): SheepMoveState {
  const stage = SHEEP_STAGES[stageIndex]
  if (!stage) throw new Error('存在しないステージです')
  return {
    status: 'playing',
    stageIndex,
    player: stage.player,
    sheep: stage.sheep,
    moveCount: 0,
    stageStars: 0,
    totalStars: 0,
    score: 0,
    history: [],
  }
}

const blockedAt = (stage: SheepStage, position: SheepPosition) =>
  position.row < 0 || position.row >= stage.size || position.column < 0 || position.column >= stage.size ||
  stage.walls.some((wall) => samePosition(wall, position))

const starsFor = (stage: SheepStage, moveCount: number) => {
  if (moveCount <= stage.solution.length) return 3
  if (moveCount <= stage.solution.length + 4) return 2
  return 1
}

export function applySheepMoveAction(
  state: SheepMoveState,
  action: SheepMoveAction,
): SheepMoveTransition {
  const stage = SHEEP_STAGES[state.stageIndex]
  if (action.type === 'next-stage') {
    if (state.status !== 'stage-won') return { state, events: [] }
    const nextStage = SHEEP_STAGES[state.stageIndex + 1]
    return {
      state: {
        ...state,
        status: 'playing',
        stageIndex: state.stageIndex + 1,
        player: nextStage.player,
        sheep: nextStage.sheep,
        moveCount: 0,
        stageStars: 0,
        history: [],
      },
      events: [],
    }
  }

  if (state.status !== 'playing') return { state, events: [] }
  if (action.type === 'reset-stage') {
    return {
      state: { ...state, player: stage.player, sheep: stage.sheep, moveCount: 0, history: [] },
      events: [],
    }
  }
  if (action.type === 'undo') {
    const snapshot = state.history[state.history.length - 1]
    if (!snapshot) return { state, events: [] }
    return {
      state: { ...state, ...snapshot, history: state.history.slice(0, -1) },
      events: [],
    }
  }

  const vector = vectorFor[action.direction]
  const target = { row: state.player.row + vector.row, column: state.player.column + vector.column }
  if (blockedAt(stage, target)) return { state, events: [{ type: 'blocked' }] }
  const sheepIndex = state.sheep.findIndex((position) => samePosition(position, target))
  let sheep = state.sheep
  let pushed = false
  if (sheepIndex >= 0) {
    const beyond = { row: target.row + vector.row, column: target.column + vector.column }
    if (blockedAt(stage, beyond) || state.sheep.some((position) => samePosition(position, beyond))) {
      return { state, events: [{ type: 'blocked' }] }
    }
    sheep = state.sheep.map((position, index) => index === sheepIndex ? beyond : position)
    pushed = true
  }

  const moveCount = state.moveCount + 1
  const won = stage.goals.every((goal) => sheep.some((position) => samePosition(position, goal)))
  const stageStars = won ? starsFor(stage, moveCount) : 0
  const finalStage = state.stageIndex === SHEEP_STAGES.length - 1
  return {
    state: {
      ...state,
      status: won ? (finalStage ? 'finished' : 'stage-won') : 'playing',
      player: target,
      sheep,
      moveCount,
      stageStars,
      totalStars: state.totalStars + stageStars,
      score: state.score + (pushed ? 10 : 0) + (won ? 500 + stageStars * 100 : 0),
      history: [...state.history, { player: state.player, sheep: state.sheep, moveCount: state.moveCount }],
    },
    events: [
      { type: pushed ? 'sheep-pushed' : 'player-moved' },
      ...(won ? [{ type: 'stage-won', stars: stageStars } as const] : []),
      ...(won && finalStage ? [{ type: 'game-finished' } as const] : []),
    ],
  }
}

export function calculateSheepMoveResult(state: SheepMoveState): SheepMoveResult {
  if (state.status !== 'finished') throw new Error('ゲーム終了前は結果を計算できません')
  return { score: state.score, totalStars: state.totalStars, isCleared: true }
}
