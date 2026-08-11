export type SlideOrientation = 'horizontal' | 'vertical'

export type SlidePiece = {
  id: string
  kind: 'squirrel' | 'log'
  orientation: SlideOrientation
  row: number
  column: number
  length: 2 | 3
}

export type LogSlideMove = { id: string; delta: -1 | 1 }

export type LogSlideStage = {
  name: string
  size: 4 | 5 | 6
  pieces: readonly SlidePiece[]
  optimalMoves: number
  solution: readonly LogSlideMove[]
}

const sled = (row: number): SlidePiece => ({ id: 'squirrel', kind: 'squirrel', orientation: 'horizontal', row, column: 0, length: 2 })
const log = (id: string, orientation: SlideOrientation, row: number, column: number, length: 2 | 3 = 2): SlidePiece => ({ id, kind: 'log', orientation, row, column, length })
const repeatMove = (id: string, delta: -1 | 1, count: number): readonly LogSlideMove[] =>
  Array.from({ length: count }, () => ({ id, delta }))

export const LOG_SLIDE_STAGES: readonly LogSlideStage[] = [
  {
    name: 'はじめての まるた', size: 4,
    pieces: [sled(1), log('a', 'vertical', 0, 2)],
    optimalMoves: 4,
    solution: [...repeatMove('a', 1, 2), ...repeatMove('squirrel', 1, 2)],
  },
  {
    name: 'うえへ よけよう', size: 5,
    pieces: [sled(2), log('a', 'vertical', 1, 2)],
    optimalMoves: 4,
    solution: [{ id: 'a', delta: -1 }, ...repeatMove('squirrel', 1, 3)],
  },
  {
    name: 'まるたを ずらして', size: 5,
    pieces: [sled(2), log('a', 'vertical', 1, 2), log('b', 'horizontal', 0, 1)],
    optimalMoves: 5,
    solution: [{ id: 'b', delta: -1 }, { id: 'a', delta: -1 }, ...repeatMove('squirrel', 1, 3)],
  },
  {
    name: 'ながい まるた', size: 6,
    pieces: [sled(2), log('a', 'vertical', 0, 2, 3), log('b', 'horizontal', 5, 1)],
    optimalMoves: 8,
    solution: [{ id: 'b', delta: -1 }, ...repeatMove('a', 1, 3), ...repeatMove('squirrel', 1, 4)],
  },
  {
    name: 'じゅんばんに うごかそう', size: 6,
    pieces: [sled(2), log('a', 'vertical', 0, 2, 3), log('b', 'horizontal', 5, 1), log('c', 'vertical', 4, 3)],
    optimalMoves: 10,
    solution: [{ id: 'c', delta: -1 }, ...repeatMove('b', 1, 2), ...repeatMove('a', 1, 3), ...repeatMove('squirrel', 1, 4)],
  },
  {
    name: 'どんぐり だいだっしゅつ', size: 6,
    pieces: [sled(2), log('a', 'vertical', 0, 2, 3), log('b', 'horizontal', 5, 1), log('c', 'vertical', 4, 3), log('d', 'vertical', 1, 4)],
    optimalMoves: 11,
    solution: [{ id: 'c', delta: -1 }, ...repeatMove('b', 1, 2), ...repeatMove('a', 1, 3), { id: 'd', delta: -1 }, ...repeatMove('squirrel', 1, 4)],
  },
  {
    name: 'にほんの たてまるた', size: 5,
    pieces: [sled(2), log('a', 'vertical', 1, 2), log('b', 'vertical', 1, 3)],
    optimalMoves: 5,
    solution: [{ id: 'a', delta: -1 }, { id: 'b', delta: -1 }, ...repeatMove('squirrel', 1, 3)],
  },
  {
    name: 'ひろい ぬまの まるた', size: 6,
    pieces: [sled(3), log('a', 'vertical', 2, 2), log('b', 'vertical', 2, 4)],
    optimalMoves: 6,
    solution: [{ id: 'a', delta: -1 }, { id: 'b', delta: -1 }, ...repeatMove('squirrel', 1, 4)],
  },
  {
    name: 'ながさを みきわめて', size: 6,
    pieces: [sled(2), log('a', 'vertical', 0, 2, 3), log('b', 'vertical', 1, 4)],
    optimalMoves: 8,
    solution: [{ id: 'b', delta: -1 }, ...repeatMove('a', 1, 3), ...repeatMove('squirrel', 1, 4)],
  },
  {
    name: 'したから じゅんばん', size: 6,
    pieces: [sled(1), log('a', 'vertical', 0, 2), log('b', 'horizontal', 3, 1, 3)],
    optimalMoves: 8,
    solution: [...repeatMove('b', 1, 2), ...repeatMove('a', 1, 2), ...repeatMove('squirrel', 1, 4)],
  },
  {
    name: 'うえから じゅんばん', size: 6,
    pieces: [sled(3), log('a', 'vertical', 1, 2, 3), log('b', 'vertical', 2, 3), log('c', 'horizontal', 0, 1, 3)],
    optimalMoves: 8,
    solution: [...repeatMove('c', 1, 2), { id: 'a', delta: -1 }, { id: 'b', delta: -1 }, ...repeatMove('squirrel', 1, 4)],
  },
  {
    name: 'どんぐり スライドマスター', size: 6,
    pieces: [
      sled(2),
      log('a', 'vertical', 0, 2, 3),
      log('b', 'horizontal', 5, 1),
      log('c', 'vertical', 4, 3),
      log('d', 'vertical', 1, 4),
      log('e', 'vertical', 0, 5, 3),
    ],
    optimalMoves: 14,
    solution: [{ id: 'c', delta: -1 }, ...repeatMove('b', 1, 2), ...repeatMove('a', 1, 3), { id: 'd', delta: -1 }, ...repeatMove('e', 1, 3), ...repeatMove('squirrel', 1, 4)],
  },
]

export type LogSlideState = {
  status: 'playing' | 'stage-won' | 'finished'
  stageIndex: number
  pieces: readonly SlidePiece[]
  history: readonly (readonly SlidePiece[])[]
  moveCount: number
  stageStars: number
  totalStars: number
  score: number
}

export type LogSlideAction =
  | ({ type: 'move-piece' } & LogSlideMove)
  | { type: 'undo' }
  | { type: 'reset-stage' }
  | { type: 'next-stage' }

export type LogSlideEvent =
  | { type: 'piece-moved'; id: string; delta: -1 | 1 }
  | { type: 'blocked'; id: string }
  | { type: 'stage-won'; stars: number }
  | { type: 'game-finished' }

export type LogSlideTransition = { state: LogSlideState; events: readonly LogSlideEvent[] }
export type LogSlideResult = { score: number; totalStars: number; isCleared: boolean }

const copyPieces = (pieces: readonly SlidePiece[]): readonly SlidePiece[] => pieces.map((piece) => ({ ...piece }))

export function startLogSlide(stageIndex = 0): LogSlideState {
  const stage = LOG_SLIDE_STAGES[stageIndex]
  if (!stage) throw new Error('存在しないステージです')
  return {
    status: 'playing', stageIndex, pieces: copyPieces(stage.pieces), history: [],
    moveCount: 0, stageStars: 0, totalStars: 0, score: 0,
  }
}

const cellsFor = (piece: SlidePiece) => Array.from({ length: piece.length }, (_, offset) => ({
  row: piece.row + (piece.orientation === 'vertical' ? offset : 0),
  column: piece.column + (piece.orientation === 'horizontal' ? offset : 0),
}))

const canPlace = (piece: SlidePiece, pieces: readonly SlidePiece[], size: number) => {
  const occupied = new Set(
    pieces.filter((other) => other.id !== piece.id).flatMap(cellsFor).map(({ row, column }) => `${row}:${column}`),
  )
  return cellsFor(piece).every(({ row, column }) =>
    row >= 0 && row < size && column >= 0 && column < size && !occupied.has(`${row}:${column}`),
  )
}

const starsFor = (optimalMoves: number, moveCount: number) => {
  if (moveCount <= optimalMoves) return 3
  if (moveCount <= optimalMoves + 3) return 2
  return 1
}

export function applyLogSlideAction(state: LogSlideState, action: LogSlideAction): LogSlideTransition {
  const stage = LOG_SLIDE_STAGES[state.stageIndex]
  if (action.type === 'next-stage') {
    if (state.status !== 'stage-won') return { state, events: [] }
    const nextStage = LOG_SLIDE_STAGES[state.stageIndex + 1]
    if (!nextStage) return { state, events: [] }
    return {
      state: {
        ...state, status: 'playing', stageIndex: state.stageIndex + 1,
        pieces: copyPieces(nextStage.pieces), history: [], moveCount: 0, stageStars: 0,
      },
      events: [],
    }
  }
  if (state.status !== 'playing') return { state, events: [] }
  if (action.type === 'reset-stage') {
    return { state: { ...state, pieces: copyPieces(stage.pieces), history: [], moveCount: 0 }, events: [] }
  }
  if (action.type === 'undo') {
    const previous = state.history[state.history.length - 1]
    if (!previous) return { state, events: [] }
    return { state: { ...state, pieces: previous, history: state.history.slice(0, -1), moveCount: state.moveCount - 1 }, events: [] }
  }

  const piece = state.pieces.find((candidate) => candidate.id === action.id)
  if (!piece) return { state, events: [{ type: 'blocked', id: action.id }] }
  const moved = {
    ...piece,
    row: piece.row + (piece.orientation === 'vertical' ? action.delta : 0),
    column: piece.column + (piece.orientation === 'horizontal' ? action.delta : 0),
  }
  if (!canPlace(moved, state.pieces, stage.size)) return { state, events: [{ type: 'blocked', id: action.id }] }

  const pieces = state.pieces.map((candidate) => candidate.id === action.id ? moved : candidate)
  const moveCount = state.moveCount + 1
  const movedEvent = { type: 'piece-moved' as const, id: action.id, delta: action.delta }
  const squirrel = pieces.find((candidate) => candidate.kind === 'squirrel')
  const won = squirrel ? squirrel.column + squirrel.length === stage.size : false
  if (!won) {
    return { state: { ...state, pieces, history: [...state.history, state.pieces], moveCount }, events: [movedEvent] }
  }

  const stageStars = starsFor(stage.optimalMoves, moveCount)
  const finalStage = state.stageIndex === LOG_SLIDE_STAGES.length - 1
  return {
    state: {
      ...state, status: finalStage ? 'finished' : 'stage-won', pieces,
      history: [...state.history, state.pieces], moveCount, stageStars,
      totalStars: state.totalStars + stageStars, score: state.score + 500 + stageStars * 100,
    },
    events: [movedEvent, { type: 'stage-won', stars: stageStars }, ...(finalStage ? [{ type: 'game-finished' } as const] : [])],
  }
}

export function calculateLogSlideResult(state: LogSlideState): LogSlideResult {
  if (state.status !== 'finished') throw new Error('ゲーム終了前は結果を計算できません')
  return { score: state.score, totalStars: state.totalStars, isCleared: true }
}
