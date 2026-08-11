export type BeePoint = { row: number; column: number }
export type BeeFlower = BeePoint & { id: string; icon: string }
export type BeeTarget = 'hive' | string

export type BeeRouteStage = {
  name: string
  hive: BeePoint
  flowers: readonly BeeFlower[]
  energyBudget: number
  optimalEnergy: number
  solution: readonly BeeTarget[]
}

const flower = (id: string, icon: string, row: number, column: number): BeeFlower => ({ id, icon, row, column })

export const BEE_ROUTE_STAGES: readonly BeeRouteStage[] = [
  { name: 'はじめての みつあつめ', hive: { row: 0, column: 0 }, flowers: [flower('a', '🌷', 0, 2)], energyBudget: 6, optimalEnergy: 4, solution: ['a', 'hive'] },
  { name: 'ふたつの おはな', hive: { row: 0, column: 0 }, flowers: [flower('a', '🌻', 0, 3), flower('b', '🌼', 2, 3)], energyBudget: 12, optimalEnergy: 10, solution: ['a', 'b', 'hive'] },
  { name: 'しかくい おはなばたけ', hive: { row: 0, column: 0 }, flowers: [flower('a', '🌷', 0, 4), flower('b', '🌻', 4, 4), flower('c', '🌼', 4, 0)], energyBudget: 20, optimalEnergy: 16, solution: ['a', 'b', 'c', 'hive'] },
  { name: 'よすみを ぐるり', hive: { row: 2, column: 2 }, flowers: [flower('a', '🌹', 0, 0), flower('b', '🌷', 0, 4), flower('c', '🌻', 4, 4), flower('d', '🌼', 4, 0)], energyBudget: 24, optimalEnergy: 20, solution: ['a', 'b', 'c', 'd', 'hive'] },
  { name: 'ちかい おはなから', hive: { row: 0, column: 0 }, flowers: [flower('a', '🌷', 0, 2), flower('b', '🌹', 0, 4), flower('c', '🌻', 3, 4), flower('d', '🌼', 4, 1)], energyBudget: 20, optimalEnergy: 16, solution: ['a', 'b', 'c', 'd', 'hive'] },
  { name: 'はちみつ だいぼうけん', hive: { row: 2, column: 2 }, flowers: [flower('a', '🌹', 0, 0), flower('b', '🌷', 0, 2), flower('c', '🌻', 0, 4), flower('d', '🌼', 4, 4), flower('e', '🪻', 4, 0)], energyBudget: 24, optimalEnergy: 20, solution: ['a', 'b', 'c', 'd', 'e', 'hive'] },
]

type BeeRouteHistory = {
  position: BeeTarget
  collected: readonly string[]
  energyLeft: number
  route: readonly BeeTarget[]
}

export type BeeRouteState = {
  status: 'playing' | 'failed' | 'stage-won' | 'finished'
  stageIndex: number
  position: BeeTarget
  collected: readonly string[]
  energyLeft: number
  route: readonly BeeTarget[]
  history: readonly BeeRouteHistory[]
  attempts: number
  stageStars: number
  totalStars: number
  score: number
}

export type BeeRouteAction =
  | { type: 'fly-to'; target: BeeTarget }
  | { type: 'undo' }
  | { type: 'retry' }
  | { type: 'next-stage' }

export type BeeRouteEvent =
  | { type: 'flower-visited'; id: string; cost: number }
  | { type: 'returned-home'; cost: number }
  | { type: 'flowers-remaining' }
  | { type: 'out-of-energy' }
  | { type: 'stage-won'; stars: number }
  | { type: 'game-finished' }

export type BeeRouteTransition = { state: BeeRouteState; events: readonly BeeRouteEvent[] }
export type BeeRouteResult = { score: number; totalStars: number; isCleared: boolean }

export function startBeeRoute(stageIndex = 0): BeeRouteState {
  const stage = BEE_ROUTE_STAGES[stageIndex]
  if (!stage) throw new Error('存在しないステージです')
  return {
    status: 'playing', stageIndex, position: 'hive', collected: [], energyLeft: stage.energyBudget,
    route: ['hive'], history: [], attempts: 0, stageStars: 0, totalStars: 0, score: 0,
  }
}

const pointFor = (stage: BeeRouteStage, target: BeeTarget): BeePoint | null =>
  target === 'hive' ? stage.hive : stage.flowers.find((candidate) => candidate.id === target) ?? null

const distance = (from: BeePoint, to: BeePoint) => Math.abs(from.row - to.row) + Math.abs(from.column - to.column)
const starsFor = (stage: BeeRouteStage, usedEnergy: number) => usedEnergy <= stage.optimalEnergy ? 3 : usedEnergy <= stage.optimalEnergy + 2 ? 2 : 1

export function applyBeeRouteAction(state: BeeRouteState, action: BeeRouteAction): BeeRouteTransition {
  const stage = BEE_ROUTE_STAGES[state.stageIndex]
  if (action.type === 'next-stage') {
    if (state.status !== 'stage-won') return { state, events: [] }
    const nextStage = BEE_ROUTE_STAGES[state.stageIndex + 1]
    if (!nextStage) return { state, events: [] }
    return {
      state: {
        ...state, status: 'playing', stageIndex: state.stageIndex + 1, position: 'hive', collected: [],
        energyLeft: nextStage.energyBudget, route: ['hive'], history: [], attempts: 0, stageStars: 0,
      },
      events: [],
    }
  }
  if (action.type === 'retry') {
    if (state.status !== 'failed') return { state, events: [] }
    return { state: { ...state, status: 'playing', position: 'hive', collected: [], energyLeft: stage.energyBudget, route: ['hive'], history: [] }, events: [] }
  }
  if (state.status !== 'playing') return { state, events: [] }
  if (action.type === 'undo') {
    const previous = state.history[state.history.length - 1]
    if (!previous) return { state, events: [] }
    return { state: { ...state, ...previous, history: state.history.slice(0, -1) }, events: [] }
  }

  if (action.target === 'hive' && state.collected.length < stage.flowers.length) return { state, events: [{ type: 'flowers-remaining' }] }
  if (action.target === state.position || (action.target !== 'hive' && state.collected.includes(action.target))) return { state, events: [] }
  const from = pointFor(stage, state.position)
  const to = pointFor(stage, action.target)
  if (!from || !to) return { state, events: [] }
  const cost = distance(from, to)
  if (cost > state.energyLeft) {
    return { state: { ...state, status: 'failed', attempts: state.attempts + 1 }, events: [{ type: 'out-of-energy' }] }
  }

  const history: BeeRouteHistory = { position: state.position, collected: state.collected, energyLeft: state.energyLeft, route: state.route }
  const energyLeft = state.energyLeft - cost
  const route = [...state.route, action.target]
  if (action.target !== 'hive') {
    return {
      state: { ...state, position: action.target, collected: [...state.collected, action.target], energyLeft, route, history: [...state.history, history] },
      events: [{ type: 'flower-visited', id: action.target, cost }],
    }
  }

  const usedEnergy = stage.energyBudget - energyLeft
  const stageStars = starsFor(stage, usedEnergy)
  const finalStage = state.stageIndex === BEE_ROUTE_STAGES.length - 1
  return {
    state: {
      ...state, status: finalStage ? 'finished' : 'stage-won', position: 'hive', energyLeft, route,
      history: [...state.history, history], stageStars, totalStars: state.totalStars + stageStars,
      score: state.score + 500 + stageStars * 100 + energyLeft * 10,
    },
    events: [{ type: 'returned-home', cost }, { type: 'stage-won', stars: stageStars }, ...(finalStage ? [{ type: 'game-finished' } as const] : [])],
  }
}

export function calculateBeeRouteResult(state: BeeRouteState): BeeRouteResult {
  if (state.status !== 'finished') throw new Error('ゲーム終了前は結果を計算できません')
  return { score: state.score, totalStars: state.totalStars, isCleared: true }
}
