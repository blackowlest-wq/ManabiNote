export type BubbleChainStage = { name: string; size: 2 | 3 | 4; strengths: readonly number[]; solution: readonly number[] }
export const BUBBLE_CHAIN_STAGES: readonly BubbleChainStage[] = [
  { name: 'はじめての れんさ', size: 2, strengths: [1, 1, 1, 1], solution: [0] },
  { name: 'まんなかから ぽん！', size: 3, strengths: [2, 1, 2, 1, 1, 1, 2, 1, 2], solution: [1] },
  { name: 'にかい タップ', size: 3, strengths: [2, 2, 1, 1, 2, 1, 1, 2, 2], solution: [1, 1] },
  { name: 'はしから はしへ', size: 3, strengths: [3, 1, 2, 1, 2, 1, 2, 1, 3], solution: [0, 0, 0, 8] },
  { name: 'おおきな バブル', size: 4, strengths: [2, 1, 2, 1, 1, 2, 1, 2, 2, 1, 2, 1, 1, 2, 1, 2], solution: [0, 0] },
  { name: 'バブルの おまつり', size: 4, strengths: [3, 2, 1, 2, 2, 1, 2, 1, 1, 2, 1, 2, 2, 1, 2, 3], solution: [0, 1, 1, 15] },
  { name: 'まんなかの きらめき', size: 3, strengths: [2, 2, 2, 2, 1, 2, 2, 2, 2], solution: [0, 0, 1, 2, 6] },
  { name: 'ななめの ひかり', size: 3, strengths: [3, 2, 1, 2, 2, 2, 1, 2, 3], solution: [0, 0, 0, 1, 3, 8] },
  { name: 'しましま バブル', size: 4, strengths: [2, 1, 2, 2, 1, 2, 2, 1, 2, 2, 1, 2, 2, 1, 2, 2], solution: [0, 0, 2] },
  { name: 'よすみの おおだま', size: 4, strengths: [3, 2, 1, 2, 2, 1, 2, 3, 3, 2, 1, 2, 2, 1, 2, 3], solution: [0, 0, 0, 1, 3, 7, 8, 15] },
  { name: 'ぐるぐる れんさ', size: 4, strengths: [2, 3, 2, 1, 3, 2, 1, 2, 2, 1, 2, 3, 1, 2, 3, 2], solution: [0, 0, 1, 1, 2, 4, 11, 14] },
  { name: 'にじいろ フィナーレ', size: 4, strengths: [3, 2, 2, 1, 2, 1, 2, 2, 2, 2, 1, 2, 1, 2, 2, 3], solution: [0, 0, 0, 1, 2, 15] },
]

export type BubbleChainState = { status: 'playing' | 'stage-won' | 'finished'; stageIndex: number; strengths: readonly number[]; history: readonly (readonly number[])[]; moveCount: number; stageStars: number; totalStars: number; score: number }
export type BubbleChainAction = { type: 'tap-bubble'; index: number } | { type: 'undo' } | { type: 'reset-stage' } | { type: 'next-stage' }
export type BubbleChainEvent = { type: 'chain'; count: number } | { type: 'stage-won'; stars: number } | { type: 'game-finished' }
export type BubbleChainTransition = { state: BubbleChainState; events: readonly BubbleChainEvent[] }

export function startBubbleChain(stageIndex = 0): BubbleChainState {
  const stage = BUBBLE_CHAIN_STAGES[stageIndex]; if (!stage) throw new Error('存在しないステージです')
  return { status: 'playing', stageIndex, strengths: [...stage.strengths], history: [], moveCount: 0, stageStars: 0, totalStars: 0, score: 0 }
}

const burstAt = (strengths: readonly number[], size: number, index: number) => {
  const next = [...strengths]; if (!next[index]) return { strengths, count: 0 }
  const queue: number[] = []; let count = 0
  next[index] -= 1; if (next[index] === 0) queue.push(index)
  while (queue.length) {
    const current = queue.shift()!; count += 1; const row = Math.floor(current / size); const column = current % size
    for (const [dr, dc] of [[-1, 0], [1, 0], [0, -1], [0, 1]]) {
      const r = row + dr; const c = column + dc; const target = r * size + c
      if (r >= 0 && r < size && c >= 0 && c < size && next[target] > 0) { next[target] -= 1; if (next[target] === 0) queue.push(target) }
    }
  }
  return { strengths: next, count }
}

export function applyBubbleChainAction(state: BubbleChainState, action: BubbleChainAction): BubbleChainTransition {
  const stage = BUBBLE_CHAIN_STAGES[state.stageIndex]
  if (action.type === 'next-stage') { if (state.status !== 'stage-won') return { state, events: [] }; const next = BUBBLE_CHAIN_STAGES[state.stageIndex + 1]; return { state: { ...state, status: 'playing', stageIndex: state.stageIndex + 1, strengths: [...next.strengths], history: [], moveCount: 0, stageStars: 0 }, events: [] } }
  if (state.status !== 'playing') return { state, events: [] }
  if (action.type === 'reset-stage') return { state: { ...state, strengths: [...stage.strengths], history: [], moveCount: 0 }, events: [] }
  if (action.type === 'undo') { const previous = state.history[state.history.length - 1]; return previous ? { state: { ...state, strengths: previous, history: state.history.slice(0, -1), moveCount: state.moveCount - 1 }, events: [] } : { state, events: [] } }
  const burst = burstAt(state.strengths, stage.size, action.index); if (burst.strengths === state.strengths) return { state, events: [] }
  const moveCount = state.moveCount + 1; const won = burst.strengths.every((value) => value === 0)
  if (!won) return { state: { ...state, strengths: burst.strengths, history: [...state.history, state.strengths], moveCount }, events: [{ type: 'chain', count: burst.count }] }
  const stars = moveCount <= stage.solution.length ? 3 : moveCount <= stage.solution.length + 2 ? 2 : 1; const final = state.stageIndex === BUBBLE_CHAIN_STAGES.length - 1
  return { state: { ...state, status: final ? 'finished' : 'stage-won', strengths: burst.strengths, history: [...state.history, state.strengths], moveCount, stageStars: stars, totalStars: state.totalStars + stars, score: state.score + 500 + stars * 100 }, events: [{ type: 'chain', count: burst.count }, { type: 'stage-won', stars }, ...(final ? [{ type: 'game-finished' } as const] : [])] }
}

export const calculateBubbleChainResult = (state: BubbleChainState) => { if (state.status !== 'finished') throw new Error('ゲーム終了前です'); return { score: state.score, totalStars: state.totalStars, isCleared: true } }
