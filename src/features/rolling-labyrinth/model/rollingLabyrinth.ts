export type LabyrinthPosition = { row: number; column: number }
export type LabyrinthRotation = 'rotate-clockwise' | 'rotate-counterclockwise'

export type LabyrinthStar = LabyrinthPosition & { id: string }

export type LabyrinthStage = {
  name: string
  size: number
  start: LabyrinthPosition
  goal: LabyrinthPosition
  walls: readonly LabyrinthPosition[]
  stars: readonly LabyrinthStar[]
  solution: readonly LabyrinthRotation[]
}

export const LABYRINTH_STAGES: readonly LabyrinthStage[] = [
  {
    name: 'はじめての くるくる', size: 5,
    start: { row: 0, column: 0 }, goal: { row: 4, column: 4 }, walls: [], stars: [],
    solution: ['rotate-clockwise', 'rotate-counterclockwise'],
  },
  {
    name: 'ほしを ひろおう', size: 5,
    start: { row: 4, column: 0 }, goal: { row: 0, column: 0 }, walls: [],
    stars: [{ id: 's2-star', row: 0, column: 4 }],
    solution: ['rotate-clockwise', 'rotate-clockwise', 'rotate-clockwise'],
  },
  {
    name: 'いわで ストップ', size: 5,
    start: { row: 4, column: 0 }, goal: { row: 0, column: 4 },
    walls: [{ row: 4, column: 3 }, { row: 1, column: 2 }],
    stars: [{ id: 's3-star', row: 4, column: 2 }],
    solution: ['rotate-clockwise', 'rotate-clockwise', 'rotate-counterclockwise', 'rotate-clockwise'],
  },
  {
    name: 'かわべの ほし', size: 5,
    start: { row: 0, column: 0 }, goal: { row: 4, column: 0 }, walls: [],
    stars: [{ id: 's4-a', row: 0, column: 4 }, { id: 's4-b', row: 4, column: 4 }],
    solution: ['rotate-clockwise', 'rotate-counterclockwise', 'rotate-counterclockwise'],
  },
  {
    name: 'ほしの たき', size: 5,
    start: { row: 4, column: 0 }, goal: { row: 0, column: 0 }, walls: [],
    stars: [
      { id: 's5-a', row: 4, column: 4 },
      { id: 's5-b', row: 2, column: 4 },
      { id: 's5-c', row: 0, column: 4 },
    ],
    solution: ['rotate-clockwise', 'rotate-clockwise', 'rotate-clockwise'],
  },
  {
    name: 'さいごの いわやま', size: 5,
    start: { row: 0, column: 0 }, goal: { row: 4, column: 4 },
    walls: [{ row: 0, column: 3 }, { row: 3, column: 2 }],
    stars: [{ id: 's6-a', row: 0, column: 2 }, { id: 's6-b', row: 2, column: 2 }],
    solution: ['rotate-clockwise', 'rotate-counterclockwise', 'rotate-clockwise', 'rotate-counterclockwise'],
  },
]

export type RollingLabyrinthState = {
  status: 'playing' | 'stage-won' | 'finished'
  stageIndex: number
  orientation: 0 | 1 | 2 | 3
  ball: LabyrinthPosition
  collectedStarIds: readonly string[]
  rotations: number
  totalStars: number
  score: number
}

export type RollingLabyrinthAction =
  | { type: LabyrinthRotation }
  | { type: 'reset-stage' }
  | { type: 'next-stage' }

export type RollingLabyrinthEvent =
  | { type: 'ball-rolled'; from: LabyrinthPosition; to: LabyrinthPosition }
  | { type: 'star-collected'; starId: string }
  | { type: 'stage-won' }
  | { type: 'game-finished' }

export type RollingLabyrinthTransition = {
  state: RollingLabyrinthState
  events: readonly RollingLabyrinthEvent[]
}

export type RollingLabyrinthResult = {
  score: number
  totalStars: number
  isCleared: boolean
}

const samePosition = (left: LabyrinthPosition, right: LabyrinthPosition) =>
  left.row === right.row && left.column === right.column

export function startRollingLabyrinth(stageIndex = 0): RollingLabyrinthState {
  const stage = LABYRINTH_STAGES[stageIndex]
  if (!stage) throw new Error('存在しないステージです')
  return {
    status: 'playing',
    stageIndex,
    orientation: 0,
    ball: stage.start,
    collectedStarIds: [],
    rotations: 0,
    totalStars: 0,
    score: 0,
  }
}

const gravityVectors: readonly LabyrinthPosition[] = [
  { row: 1, column: 0 },
  { row: 0, column: 1 },
  { row: -1, column: 0 },
  { row: 0, column: -1 },
]

export function applyLabyrinthAction(
  state: RollingLabyrinthState,
  action: RollingLabyrinthAction,
): RollingLabyrinthTransition {
  const stage = LABYRINTH_STAGES[state.stageIndex]
  if (action.type === 'next-stage') {
    if (state.status !== 'stage-won') return { state, events: [] }
    const nextStage = LABYRINTH_STAGES[state.stageIndex + 1]
    return {
      state: {
        ...state,
        status: 'playing',
        stageIndex: state.stageIndex + 1,
        orientation: 0,
        ball: nextStage.start,
        collectedStarIds: [],
        rotations: 0,
      },
      events: [],
    }
  }

  if (state.status !== 'playing') return { state, events: [] }
  if (action.type === 'reset-stage') {
    return {
      state: { ...state, orientation: 0, ball: stage.start, collectedStarIds: [], rotations: 0 },
      events: [],
    }
  }

  const orientation = ((state.orientation + (action.type === 'rotate-clockwise' ? 1 : 3)) % 4) as 0 | 1 | 2 | 3
  const vector = gravityVectors[orientation]
  let ball = state.ball
  let collectedStarIds = [...state.collectedStarIds]
  const events: RollingLabyrinthEvent[] = []
  let reachedGoal = false

  while (true) {
    const next = { row: ball.row + vector.row, column: ball.column + vector.column }
    const outside = next.row < 0 || next.row >= stage.size || next.column < 0 || next.column >= stage.size
    if (outside || stage.walls.some((wall) => samePosition(wall, next))) break
    ball = next
    const star = stage.stars.find((candidate) => samePosition(candidate, ball))
    if (star && !collectedStarIds.includes(star.id)) {
      collectedStarIds.push(star.id)
      events.push({ type: 'star-collected', starId: star.id })
    }
    if (samePosition(ball, stage.goal) && collectedStarIds.length === stage.stars.length) reachedGoal = true
  }

  events.unshift({ type: 'ball-rolled', from: state.ball, to: ball })
  const finalStage = state.stageIndex === LABYRINTH_STAGES.length - 1
  if (reachedGoal) events.push({ type: 'stage-won' }, ...(finalStage ? [{ type: 'game-finished' } as const] : []))
  return {
    state: {
      ...state,
      status: reachedGoal ? (finalStage ? 'finished' : 'stage-won') : 'playing',
      orientation,
      ball,
      collectedStarIds,
      rotations: state.rotations + 1,
      totalStars: state.totalStars + events.filter((event) => event.type === 'star-collected').length,
      score: state.score + events.filter((event) => event.type === 'star-collected').length * 150 + (reachedGoal ? 500 : 0),
    },
    events,
  }
}

export function calculateRollingLabyrinthResult(state: RollingLabyrinthState): RollingLabyrinthResult {
  if (state.status !== 'finished') throw new Error('ゲーム終了前は結果を計算できません')
  return { score: state.score, totalStars: state.totalStars, isCleared: true }
}
