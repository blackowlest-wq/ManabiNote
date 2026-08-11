export type DanceSpotlightStage = {
  name: string
  pattern: readonly number[]
  beats: number
  intervalMs: number
}

export const DANCE_SPOTLIGHT_STAGES: readonly DanceSpotlightStage[] = [
  { name: 'はじめての ステージ', pattern: [0, 1, 2, 1], beats: 8, intervalMs: 1000 },
  { name: 'ジグザグ ダンス', pattern: [0, 2, 1, 2], beats: 12, intervalMs: 900 },
  { name: 'スターの リズム', pattern: [2, 0, 2, 1, 0], beats: 15, intervalMs: 800 },
  { name: 'キラキラ フィナーレ', pattern: [0, 2, 1, 0, 1, 2], beats: 18, intervalMs: 700 },
]

export type DanceSpotlightState = {
  status: 'playing' | 'failed' | 'stage-won' | 'finished'
  stageIndex: number
  dancerLane: number
  beat: number
  hearts: number
  combo: number
  bestCombo: number
  hits: number
  stageStars: number
  totalStars: number
  score: number
}

export type DanceSpotlightAction =
  | { type: 'move'; lane: number }
  | { type: 'tick' }
  | { type: 'retry' }
  | { type: 'next-stage' }

export type DanceSpotlightEvent =
  | { type: 'dancer-moved'; lane: number }
  | { type: 'spotlight-hit' }
  | { type: 'spotlight-missed' }
  | { type: 'stage-won' }
  | { type: 'stage-lost' }
  | { type: 'game-finished' }

export type DanceSpotlightTransition = { state: DanceSpotlightState; events: readonly DanceSpotlightEvent[] }

function initialStage(stageIndex: number, totals = { totalStars: 0, score: 0, bestCombo: 0 }): DanceSpotlightState {
  if (!DANCE_SPOTLIGHT_STAGES[stageIndex]) throw new Error('存在しないステージです')
  return {
    status: 'playing',
    stageIndex,
    dancerLane: 1,
    beat: 0,
    hearts: 3,
    combo: 0,
    bestCombo: totals.bestCombo,
    hits: 0,
    stageStars: 0,
    totalStars: totals.totalStars,
    score: totals.score,
  }
}

export function startDanceSpotlight(stageIndex = 0): DanceSpotlightState {
  return initialStage(stageIndex)
}

export function applyDanceSpotlightAction(state: DanceSpotlightState, action: DanceSpotlightAction): DanceSpotlightTransition {
  if (action.type === 'retry') {
    if (state.status !== 'failed') return { state, events: [] }
    return { state: initialStage(state.stageIndex, { totalStars: state.totalStars, score: state.score, bestCombo: state.bestCombo }), events: [] }
  }
  if (action.type === 'next-stage') {
    if (state.status !== 'stage-won') return { state, events: [] }
    return { state: initialStage(state.stageIndex + 1, { totalStars: state.totalStars, score: state.score, bestCombo: state.bestCombo }), events: [] }
  }
  if (state.status !== 'playing') return { state, events: [] }
  if (action.type === 'move') {
    if (!Number.isInteger(action.lane) || action.lane < 0 || action.lane > 2) return { state, events: [] }
    if (action.lane === state.dancerLane) return { state, events: [] }
    return { state: { ...state, dancerLane: action.lane }, events: [{ type: 'dancer-moved', lane: action.lane }] }
  }

  const stage = DANCE_SPOTLIGHT_STAGES[state.stageIndex]
  const targetLane = stage.pattern[state.beat % stage.pattern.length]
  const hit = state.dancerLane === targetLane
  const beat = state.beat + 1
  const hearts = state.hearts - (hit ? 0 : 1)
  const combo = hit ? state.combo + 1 : 0
  const bestCombo = Math.max(state.bestCombo, combo)
  const hits = state.hits + (hit ? 1 : 0)
  const score = state.score + (hit ? combo * 100 : 0)
  const events: DanceSpotlightEvent[] = [hit ? { type: 'spotlight-hit' } : { type: 'spotlight-missed' }]
  if (hearts <= 0) {
    return { state: { ...state, status: 'failed', beat, hearts, combo, bestCombo, hits, score }, events: [...events, { type: 'stage-lost' }] }
  }
  if (beat >= stage.beats) {
    const stars = hearts
    const finished = state.stageIndex === DANCE_SPOTLIGHT_STAGES.length - 1
    return {
      state: {
        ...state,
        status: finished ? 'finished' : 'stage-won',
        beat,
        hearts,
        combo,
        bestCombo,
        hits,
        stageStars: stars,
        totalStars: state.totalStars + stars,
        score: score + stars * 100,
      },
      events: [...events, { type: 'stage-won' }, ...(finished ? [{ type: 'game-finished' } as const] : [])],
    }
  }
  return { state: { ...state, beat, hearts, combo, bestCombo, hits, score }, events }
}

export function calculateDanceSpotlightResult(state: DanceSpotlightState) {
  if (state.status !== 'finished') throw new Error('ゲーム終了前です')
  return { score: state.score, stars: state.totalStars, bestCombo: state.bestCombo, isCleared: true }
}
