export type PenguinIceStage = { name: string; fish: readonly number[]; solution: readonly number[] }

export const PENGUIN_ICE_STAGES: readonly PenguinIceStage[] = [
  { name: 'はじめての こおり', fish: [1, 3, 2, 0, 2, 1, 3, 2, 3, 2, 1, 3, 0, 1, 3, 2], solution: [8, 4, 5, 6, 7] },
  { name: 'さかなの みち', fish: [3, 1, 2, 0, 1, 2, 3, 1, 2, 3, 1, 2, 0, 2, 3, 1], solution: [13, 9, 8, 4, 0] },
  { name: 'こおりの だいしょうぶ', fish: [1, 2, 3, 0, 3, 1, 2, 3, 2, 3, 1, 2, 0, 1, 2, 3], solution: [8, 4, 5, 6, 7] },
]

export type PenguinIceState = {
  status: 'playing' | 'failed' | 'stage-won' | 'finished'
  stageIndex: number
  playerIndex: number
  rivalIndex: number
  claimed: readonly number[]
  playerScore: number
  rivalScore: number
  turn: number
  totalWins: number
  score: number
}

export type PenguinIceAction = { type: 'move'; index: number } | { type: 'retry' } | { type: 'next-stage' }
export type PenguinIceEvent =
  | { type: 'player-moved'; fish: number }
  | { type: 'rival-moved'; fish: number }
  | { type: 'stage-won' }
  | { type: 'stage-lost' }
  | { type: 'game-finished' }
export type PenguinIceTransition = { state: PenguinIceState; events: readonly PenguinIceEvent[] }

const adjacent = (index: number) => {
  const row = Math.floor(index / 4); const column = index % 4
  return [[row - 1, column], [row + 1, column], [row, column - 1], [row, column + 1]]
    .filter(([r, c]) => r >= 0 && r < 4 && c >= 0 && c < 4)
    .map(([r, c]) => r * 4 + c)
}

export function startPenguinIce(stageIndex = 0): PenguinIceState {
  if (!PENGUIN_ICE_STAGES[stageIndex]) throw new Error('存在しないステージです')
  return { status: 'playing', stageIndex, playerIndex: 12, rivalIndex: 3, claimed: [12, 3], playerScore: 0, rivalScore: 0, turn: 0, totalWins: 0, score: 0 }
}

export function applyPenguinIceAction(state: PenguinIceState, action: PenguinIceAction): PenguinIceTransition {
  const stage = PENGUIN_ICE_STAGES[state.stageIndex]
  if (action.type === 'retry') return state.status === 'failed' ? { state: { ...startPenguinIce(state.stageIndex), totalWins: state.totalWins, score: state.score }, events: [] } : { state, events: [] }
  if (action.type === 'next-stage') {
    if (state.status !== 'stage-won') return { state, events: [] }
    return { state: { ...startPenguinIce(state.stageIndex + 1), totalWins: state.totalWins, score: state.score }, events: [] }
  }
  if (state.status !== 'playing' || !adjacent(state.playerIndex).includes(action.index) || state.claimed.includes(action.index) || action.index === state.rivalIndex) return { state, events: [] }

  const claimed = [...state.claimed, action.index]
  const playerScore = state.playerScore + stage.fish[action.index]
  const rivalMoves = adjacent(state.rivalIndex)
    .filter(index => !claimed.includes(index) && index !== action.index)
    .sort((a, b) => stage.fish[b] - stage.fish[a] || a - b)
  const rivalIndex = rivalMoves[0] ?? state.rivalIndex
  const rivalMoved = rivalIndex !== state.rivalIndex
  if (rivalMoved) claimed.push(rivalIndex)
  const rivalFish = rivalMoved ? stage.fish[rivalIndex] : 0
  const rivalScore = state.rivalScore + rivalFish
  const turn = state.turn + 1
  const events: PenguinIceEvent[] = [{ type: 'player-moved', fish: stage.fish[action.index] }, ...(rivalMoved ? [{ type: 'rival-moved' as const, fish: rivalFish }] : [])]
  if (turn < 5) return { state: { ...state, playerIndex: action.index, rivalIndex, claimed, playerScore, rivalScore, turn }, events }

  const won = playerScore > rivalScore
  const final = won && state.stageIndex === PENGUIN_ICE_STAGES.length - 1
  return {
    state: { ...state, status: final ? 'finished' : won ? 'stage-won' : 'failed', playerIndex: action.index, rivalIndex, claimed, playerScore, rivalScore, turn, totalWins: state.totalWins + (won ? 1 : 0), score: state.score + (won ? playerScore * 100 : 0) },
    events: [...events, won ? { type: 'stage-won' } : { type: 'stage-lost' }, ...(final ? [{ type: 'game-finished' } as const] : [])],
  }
}

export function calculatePenguinIceResult(state: PenguinIceState) {
  if (state.status !== 'finished') throw new Error('ゲーム終了前です')
  return { score: state.score, wins: state.totalWins, isCleared: true }
}
