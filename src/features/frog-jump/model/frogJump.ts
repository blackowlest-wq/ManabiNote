export type FrogDirection = 'left' | 'right'
export type FrogStone = FrogDirection | null

export type FrogJumpStage = {
  name: string
  rightCount: number
  leftCount: number
  optimalMoves: number
  solution: readonly number[]
}

export const FROG_JUMP_STAGES: readonly FrogJumpStage[] = [
  { name: 'はじめての いけ', rightCount: 1, leftCount: 1, optimalMoves: 3, solution: [0, 2, 1] },
  { name: 'さんびき ぴょん', rightCount: 2, leftCount: 1, optimalMoves: 5, solution: [1, 3, 2, 0, 1] },
  { name: 'よんひき ぴょん', rightCount: 2, leftCount: 2, optimalMoves: 8, solution: [1, 3, 4, 2, 0, 1, 3, 2] },
  { name: 'はすのは こうさてん', rightCount: 3, leftCount: 2, optimalMoves: 11, solution: [2, 4, 5, 3, 1, 0, 2, 4, 3, 1, 2] },
  { name: 'かえるの だいこうしん', rightCount: 3, leftCount: 3, optimalMoves: 15, solution: [2, 4, 5, 3, 1, 0, 2, 4, 6, 5, 3, 1, 2, 4, 3] },
  { name: 'おおきな いけ', rightCount: 4, leftCount: 3, optimalMoves: 19, solution: [3, 5, 6, 4, 2, 1, 3, 5, 7, 6, 4, 2, 0, 1, 3, 5, 4, 2, 3] },
]

export type FrogJumpState = {
  status: 'playing' | 'stage-won' | 'finished'
  stageIndex: number
  board: readonly FrogStone[]
  history: readonly (readonly FrogStone[])[]
  moveCount: number
  stageStars: number
  totalStars: number
  score: number
}

export type FrogJumpAction =
  | { type: 'tap-frog'; index: number }
  | { type: 'undo' }
  | { type: 'reset-stage' }
  | { type: 'next-stage' }

export type FrogJumpEvent =
  | { type: 'frog-moved'; from: number; to: number; jumped: boolean }
  | { type: 'blocked' }
  | { type: 'stage-won'; stars: number }
  | { type: 'game-finished' }

export type FrogJumpTransition = {
  state: FrogJumpState
  events: readonly FrogJumpEvent[]
}

export type FrogJumpResult = {
  score: number
  totalStars: number
  isCleared: boolean
}

const initialBoard = (stage: FrogJumpStage): readonly FrogStone[] => [
  ...Array.from<FrogDirection>({ length: stage.rightCount }).fill('right'),
  null,
  ...Array.from<FrogDirection>({ length: stage.leftCount }).fill('left'),
]

const goalBoard = (stage: FrogJumpStage): readonly FrogStone[] => [
  ...Array.from<FrogDirection>({ length: stage.leftCount }).fill('left'),
  null,
  ...Array.from<FrogDirection>({ length: stage.rightCount }).fill('right'),
]

const isSameBoard = (first: readonly FrogStone[], second: readonly FrogStone[]) =>
  first.length === second.length && first.every((frog, index) => frog === second[index])

export function startFrogJump(stageIndex = 0): FrogJumpState {
  const stage = FROG_JUMP_STAGES[stageIndex]
  if (!stage) throw new Error('存在しないステージです')
  return {
    status: 'playing',
    stageIndex,
    board: initialBoard(stage),
    history: [],
    moveCount: 0,
    stageStars: 0,
    totalStars: 0,
    score: 0,
  }
}

const starsFor = (optimalMoves: number, moveCount: number) => {
  if (moveCount <= optimalMoves) return 3
  if (moveCount <= optimalMoves + 3) return 2
  return 1
}

const moveDestination = (board: readonly FrogStone[], index: number) => {
  const frog = board[index]
  if (!frog) return null
  const direction = frog === 'right' ? 1 : -1
  const next = index + direction
  if (board[next] === null) return next
  const landing = index + direction * 2
  if (next >= 0 && next < board.length && board[next] !== null && board[landing] === null) return landing
  return null
}

export function applyFrogJumpAction(state: FrogJumpState, action: FrogJumpAction): FrogJumpTransition {
  const stage = FROG_JUMP_STAGES[state.stageIndex]

  if (action.type === 'next-stage') {
    if (state.status !== 'stage-won') return { state, events: [] }
    const nextStage = FROG_JUMP_STAGES[state.stageIndex + 1]
    if (!nextStage) return { state, events: [] }
    return {
      state: {
        ...state,
        status: 'playing',
        stageIndex: state.stageIndex + 1,
        board: initialBoard(nextStage),
        history: [],
        moveCount: 0,
        stageStars: 0,
      },
      events: [],
    }
  }

  if (state.status !== 'playing') return { state, events: [] }

  if (action.type === 'reset-stage') {
    return { state: { ...state, board: initialBoard(stage), history: [], moveCount: 0 }, events: [] }
  }

  if (action.type === 'undo') {
    const previous = state.history[state.history.length - 1]
    if (!previous) return { state, events: [] }
    return {
      state: {
        ...state,
        board: previous,
        history: state.history.slice(0, -1),
        moveCount: state.moveCount - 1,
      },
      events: [],
    }
  }

  const destination = moveDestination(state.board, action.index)
  if (destination === null) return { state, events: [{ type: 'blocked' }] }

  const board = [...state.board]
  board[destination] = board[action.index]
  board[action.index] = null
  const moveCount = state.moveCount + 1
  const movedEvent = {
    type: 'frog-moved' as const,
    from: action.index,
    to: destination,
    jumped: Math.abs(destination - action.index) === 2,
  }
  if (!isSameBoard(board, goalBoard(stage))) {
    return {
      state: { ...state, board, history: [...state.history, state.board], moveCount },
      events: [movedEvent],
    }
  }

  const stageStars = starsFor(stage.optimalMoves, moveCount)
  const finalStage = state.stageIndex === FROG_JUMP_STAGES.length - 1
  return {
    state: {
      ...state,
      status: finalStage ? 'finished' : 'stage-won',
      board,
      history: [...state.history, state.board],
      moveCount,
      stageStars,
      totalStars: state.totalStars + stageStars,
      score: state.score + 500 + stageStars * 100,
    },
    events: [
      movedEvent,
      { type: 'stage-won', stars: stageStars },
      ...(finalStage ? [{ type: 'game-finished' } as const] : []),
    ],
  }
}

export function calculateFrogJumpResult(state: FrogJumpState): FrogJumpResult {
  if (state.status !== 'finished') throw new Error('ゲーム終了前は結果を計算できません')
  return { score: state.score, totalStars: state.totalStars, isCleared: true }
}
