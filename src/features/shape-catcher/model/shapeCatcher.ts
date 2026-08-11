export type ShapeKind = 'bar' | 'corner' | 'tee'
export type ShapePiece = { kind: ShapeKind; rotation: number }
export type ShapeCatcherStage = { name: string; pieces: readonly ShapePiece[]; dropTicks: number; intervalMs: number }

export const SHAPE_CATCHER_STAGES: readonly ShapeCatcherStage[] = [
  { name: 'ぼうの かたち', pieces: [{ kind: 'bar', rotation: 0 }, { kind: 'bar', rotation: 1 }, { kind: 'bar', rotation: 0 }, { kind: 'bar', rotation: 1 }], dropTicks: 5, intervalMs: 850 },
  { name: 'まがった かたち', pieces: [{ kind: 'corner', rotation: 0 }, { kind: 'corner', rotation: 1 }, { kind: 'corner', rotation: 3 }, { kind: 'corner', rotation: 2 }, { kind: 'corner', rotation: 0 }], dropTicks: 5, intervalMs: 800 },
  { name: '3つの かたち', pieces: [{ kind: 'bar', rotation: 1 }, { kind: 'tee', rotation: 2 }, { kind: 'corner', rotation: 3 }, { kind: 'tee', rotation: 0 }, { kind: 'bar', rotation: 0 }, { kind: 'corner', rotation: 1 }], dropTicks: 4, intervalMs: 750 },
  { name: 'くるくる フィナーレ', pieces: [{ kind: 'tee', rotation: 1 }, { kind: 'corner', rotation: 2 }, { kind: 'bar', rotation: 1 }, { kind: 'tee', rotation: 3 }, { kind: 'corner', rotation: 0 }, { kind: 'bar', rotation: 0 }, { kind: 'tee', rotation: 2 }], dropTicks: 3, intervalMs: 700 },
]

export type ShapeCatcherState = {
  status: 'playing' | 'failed' | 'stage-won' | 'finished'
  stageIndex: number
  pieceIndex: number
  fall: number
  rotations: Record<ShapeKind, number>
  hearts: number
  combo: number
  bestCombo: number
  caught: number
  stageStars: number
  totalStars: number
  score: number
}

export type ShapeCatcherAction = { type: 'rotate'; kind: ShapeKind } | { type: 'tick' } | { type: 'retry' } | { type: 'next-stage' }
export type ShapeCatcherEvent = { type: 'rotated' } | { type: 'caught' } | { type: 'missed' } | { type: 'stage-won' } | { type: 'stage-lost' } | { type: 'game-finished' }
export type ShapeCatcherTransition = { state: ShapeCatcherState; events: readonly ShapeCatcherEvent[] }

function initialStage(stageIndex: number, totals = { totalStars: 0, score: 0, bestCombo: 0 }): ShapeCatcherState {
  const stage = SHAPE_CATCHER_STAGES[stageIndex]
  if (!stage) throw new Error('存在しないステージです')
  return { status: 'playing', stageIndex, pieceIndex: 0, fall: stage.dropTicks, rotations: { bar: 0, corner: 0, tee: 0 }, hearts: 3, combo: 0, bestCombo: totals.bestCombo, caught: 0, stageStars: 0, totalStars: totals.totalStars, score: totals.score }
}

export function startShapeCatcher(stageIndex = 0) { return initialStage(stageIndex) }

export function applyShapeCatcherAction(state: ShapeCatcherState, action: ShapeCatcherAction): ShapeCatcherTransition {
  if (action.type === 'retry') return state.status === 'failed' ? { state: initialStage(state.stageIndex, state), events: [] } : { state, events: [] }
  if (action.type === 'next-stage') return state.status === 'stage-won' ? { state: initialStage(state.stageIndex + 1, state), events: [] } : { state, events: [] }
  if (state.status !== 'playing') return { state, events: [] }
  if (action.type === 'rotate') return { state: { ...state, rotations: { ...state.rotations, [action.kind]: (state.rotations[action.kind] + 1) % 4 } }, events: [{ type: 'rotated' }] }
  if (state.fall > 1) return { state: { ...state, fall: state.fall - 1 }, events: [] }

  const stage = SHAPE_CATCHER_STAGES[state.stageIndex]
  const piece = stage.pieces[state.pieceIndex]
  const caught = state.rotations[piece.kind] === piece.rotation
  const hearts = state.hearts - (caught ? 0 : 1)
  const combo = caught ? state.combo + 1 : 0
  const bestCombo = Math.max(state.bestCombo, combo)
  const caughtCount = state.caught + (caught ? 1 : 0)
  const score = state.score + (caught ? combo * 100 : 0)
  const events: ShapeCatcherEvent[] = [caught ? { type: 'caught' } : { type: 'missed' }]
  if (hearts <= 0) return { state: { ...state, status: 'failed', fall: 0, hearts, combo, bestCombo, caught: caughtCount, score }, events: [...events, { type: 'stage-lost' }] }
  const pieceIndex = state.pieceIndex + 1
  if (pieceIndex >= stage.pieces.length) {
    const stars = hearts
    const finished = state.stageIndex === SHAPE_CATCHER_STAGES.length - 1
    return { state: { ...state, status: finished ? 'finished' : 'stage-won', pieceIndex, fall: 0, hearts, combo, bestCombo, caught: caughtCount, stageStars: stars, totalStars: state.totalStars + stars, score: score + stars * 100 }, events: [...events, { type: 'stage-won' }, ...(finished ? [{ type: 'game-finished' } as const] : [])] }
  }
  return { state: { ...state, pieceIndex, fall: stage.dropTicks, hearts, combo, bestCombo, caught: caughtCount, score }, events }
}

export function calculateShapeCatcherResult(state: ShapeCatcherState) {
  if (state.status !== 'finished') throw new Error('ゲーム終了前です')
  return { score: state.score, stars: state.totalStars, bestCombo: state.bestCombo, isCleared: true }
}
