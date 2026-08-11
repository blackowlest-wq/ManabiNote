export type CatChaseStage = {
  name: string
  size: 4 | 5
  catStart: number
  mouseStart: number
  walls: readonly number[]
  turnLimit: number
  solution: readonly number[]
}

export const CAT_CHASE_STAGES: readonly CatChaseStage[] = [
  { name: 'はじめての おいかけっこ', size: 4, catStart: 12, mouseStart: 3, walls: [], turnLimit: 8, solution: [8, 4, 5, 6, 2, 3] },
  { name: 'かべの こみち', size: 4, catStart: 12, mouseStart: 3, walls: [1, 5, 9], turnLimit: 8, solution: [13, 14, 10, 6, 2, 3] },
  { name: 'もりの まわりみち', size: 5, catStart: 20, mouseStart: 4, walls: [6, 7, 8, 16, 17], turnLimit: 12, solution: [15, 10, 5, 10, 11, 12, 13, 14, 9, 4] },
  { name: 'ねずみを おいつめろ', size: 5, catStart: 22, mouseStart: 2, walls: [6, 11, 13, 18], turnLimit: 8, solution: [17, 12, 7, 2, 3, 4] },
  { name: 'きの すきまを ぬけて', size: 5, catStart: 22, mouseStart: 0, walls: [1, 11, 19], turnLimit: 9, solution: [17, 12, 7, 6, 5, 0] },
  { name: 'みぎうえへ さきまわり', size: 5, catStart: 20, mouseStart: 4, walls: [8, 9, 13, 15], turnLimit: 10, solution: [21, 16, 11, 6, 1, 2, 3] },
  { name: 'まんなかの おおきなき', size: 5, catStart: 22, mouseStart: 0, walls: [12, 15, 23], turnLimit: 9, solution: [17, 16, 11, 6, 1, 2] },
  { name: 'ほそい もりみち', size: 5, catStart: 22, mouseStart: 0, walls: [2, 18, 24], turnLimit: 9, solution: [17, 12, 7, 6, 1, 0] },
  { name: 'ひだりの こみち', size: 5, catStart: 20, mouseStart: 0, walls: [16, 17, 19, 23, 24], turnLimit: 9, solution: [15, 10, 5, 0, 1, 2] },
  { name: 'みぎの まわりみち', size: 5, catStart: 24, mouseStart: 2, walls: [0, 10, 15, 18, 20], turnLimit: 9, solution: [19, 14, 9, 8, 3, 2] },
  { name: 'ながい おいかけっこ', size: 5, catStart: 20, mouseStart: 4, walls: [7, 13, 24], turnLimit: 13, solution: [15, 10, 5, 0, 1, 2, 3, 8, 9, 14] },
  { name: 'もりの チャンピオン', size: 5, catStart: 22, mouseStart: 2, walls: [1, 5, 7, 20, 21, 23, 24], turnLimit: 9, solution: [17, 12, 13, 8, 3, 4] },
]

export type CatChaseState = {
  status: 'playing' | 'failed' | 'stage-won' | 'finished'
  stageIndex: number
  catIndex: number
  mouseIndex: number
  turn: number
  attempts: number
  stageStars: number
  totalStars: number
  score: number
}

export type CatChaseAction =
  | { type: 'move'; index: number }
  | { type: 'retry' }
  | { type: 'next-stage' }

export type CatChaseEvent =
  | { type: 'cat-moved' }
  | { type: 'mouse-rested' }
  | { type: 'mouse-moved' }
  | { type: 'mouse-caught' }
  | { type: 'stage-lost' }
  | { type: 'game-finished' }

export type CatChaseTransition = { state: CatChaseState; events: readonly CatChaseEvent[] }

function adjacent(index: number, size: number) {
  const row = Math.floor(index / size)
  const column = index % size
  return [
    [row - 1, column],
    [row, column + 1],
    [row + 1, column],
    [row, column - 1],
  ]
    .filter(([nextRow, nextColumn]) => nextRow >= 0 && nextRow < size && nextColumn >= 0 && nextColumn < size)
    .map(([nextRow, nextColumn]) => nextRow * size + nextColumn)
}

function distance(from: number, to: number, size: number) {
  return Math.abs(Math.floor(from / size) - Math.floor(to / size)) + Math.abs(from % size - to % size)
}

function initialStage(stageIndex: number, totals = { totalStars: 0, score: 0, attempts: 0 }): CatChaseState {
  const stage = CAT_CHASE_STAGES[stageIndex]
  if (!stage) throw new Error('存在しないステージです')
  return {
    status: 'playing',
    stageIndex,
    catIndex: stage.catStart,
    mouseIndex: stage.mouseStart,
    turn: 0,
    attempts: totals.attempts,
    stageStars: 0,
    totalStars: totals.totalStars,
    score: totals.score,
  }
}

export function startCatChase(stageIndex = 0): CatChaseState {
  return initialStage(stageIndex)
}

function finishStage(state: CatChaseState, catIndex: number, turn: number): CatChaseTransition {
  const stage = CAT_CHASE_STAGES[state.stageIndex]
  const stars = turn <= stage.solution.length ? 3 : turn <= stage.solution.length + 2 ? 2 : 1
  const finished = state.stageIndex === CAT_CHASE_STAGES.length - 1
  return {
    state: {
      ...state,
      status: finished ? 'finished' : 'stage-won',
      catIndex,
      turn,
      stageStars: stars,
      totalStars: state.totalStars + stars,
      score: state.score + stars * 100 + Math.max(0, stage.turnLimit - turn) * 10,
    },
    events: [{ type: 'cat-moved' }, { type: 'mouse-caught' }, ...(finished ? [{ type: 'game-finished' } as const] : [])],
  }
}

export function applyCatChaseAction(state: CatChaseState, action: CatChaseAction): CatChaseTransition {
  if (action.type === 'retry') {
    if (state.status !== 'failed') return { state, events: [] }
    return { state: initialStage(state.stageIndex, { totalStars: state.totalStars, score: state.score, attempts: state.attempts + 1 }), events: [] }
  }
  if (action.type === 'next-stage') {
    if (state.status !== 'stage-won') return { state, events: [] }
    return { state: initialStage(state.stageIndex + 1, { totalStars: state.totalStars, score: state.score, attempts: state.attempts }), events: [] }
  }

  const stage = CAT_CHASE_STAGES[state.stageIndex]
  if (state.status !== 'playing' || !adjacent(state.catIndex, stage.size).includes(action.index) || stage.walls.includes(action.index)) {
    return { state, events: [] }
  }

  const turn = state.turn + 1
  if (action.index === state.mouseIndex) return finishStage(state, action.index, turn)

  const events: CatChaseEvent[] = [{ type: 'cat-moved' }]
  let mouseIndex = state.mouseIndex
  if (turn % 2 === 0) {
    const choices = adjacent(state.mouseIndex, stage.size)
      .filter(index => !stage.walls.includes(index) && index !== action.index)
      .sort((a, b) => distance(b, action.index, stage.size) - distance(a, action.index, stage.size))
    mouseIndex = choices[0] ?? state.mouseIndex
    events.push(mouseIndex === state.mouseIndex ? { type: 'mouse-rested' } : { type: 'mouse-moved' })
  } else {
    events.push({ type: 'mouse-rested' })
  }

  if (turn >= stage.turnLimit) {
    return { state: { ...state, status: 'failed', catIndex: action.index, mouseIndex, turn }, events: [...events, { type: 'stage-lost' }] }
  }
  return { state: { ...state, catIndex: action.index, mouseIndex, turn }, events }
}

export function calculateCatChaseResult(state: CatChaseState) {
  if (state.status !== 'finished') throw new Error('ゲーム終了前です')
  return { score: state.score, stars: state.totalStars, isCleared: true }
}
