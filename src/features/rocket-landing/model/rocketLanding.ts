export type RocketLandingStage = {
  name: string
  planet: string
  maxAltitude: number
  gravity: number
  thrustPower: number
  fuel: number
  safeSpeed: number
  timeLimit: number
}

export const ROCKET_LANDING_STAGES: readonly RocketLandingStage[] = [
  { name: 'つきの はじめて着陸', planet: '🌕', maxAltitude: 10, gravity: 1, thrustPower: 2, fuel: 5, safeSpeed: 2, timeLimit: 18 },
  { name: 'あかい ほし', planet: '🔴', maxAltitude: 14, gravity: 1, thrustPower: 2, fuel: 6, safeSpeed: 1, timeLimit: 22 },
  { name: 'あおい ほし', planet: '🌎', maxAltitude: 18, gravity: 2, thrustPower: 3, fuel: 8, safeSpeed: 2, timeLimit: 24 },
  { name: 'クリスタルの ほし', planet: '💎', maxAltitude: 22, gravity: 2, thrustPower: 3, fuel: 9, safeSpeed: 1, timeLimit: 28 },
]

export type RocketLandingState = {
  status: 'playing' | 'crashed' | 'stage-won' | 'finished'
  stageIndex: number
  altitude: number
  velocity: number
  fuel: number
  ticks: number
  attempts: number
  stageStars: number
  totalStars: number
  score: number
}

export type RocketLandingAction =
  | { type: 'tick' }
  | { type: 'thrust' }
  | { type: 'retry' }
  | { type: 'next-stage' }

export type RocketLandingEvent =
  | { type: 'fell' }
  | { type: 'thrusted' }
  | { type: 'fuel-empty' }
  | { type: 'landed'; speed: number }
  | { type: 'crashed'; speed: number }
  | { type: 'game-finished' }

export type RocketLandingTransition = { state: RocketLandingState; events: readonly RocketLandingEvent[] }

function initialStage(stageIndex: number, totals = { attempts: 0, totalStars: 0, score: 0 }): RocketLandingState {
  const stage = ROCKET_LANDING_STAGES[stageIndex]
  if (!stage) throw new Error('存在しないステージです')
  return {
    status: 'playing',
    stageIndex,
    altitude: stage.maxAltitude,
    velocity: 0,
    fuel: stage.fuel,
    ticks: 0,
    attempts: totals.attempts,
    stageStars: 0,
    totalStars: totals.totalStars,
    score: totals.score,
  }
}

export function startRocketLanding(stageIndex = 0): RocketLandingState {
  return initialStage(stageIndex)
}

export function applyRocketLandingAction(state: RocketLandingState, action: RocketLandingAction): RocketLandingTransition {
  if (action.type === 'retry') {
    if (state.status !== 'crashed') return { state, events: [] }
    return { state: initialStage(state.stageIndex, { attempts: state.attempts + 1, totalStars: state.totalStars, score: state.score }), events: [] }
  }
  if (action.type === 'next-stage') {
    if (state.status !== 'stage-won') return { state, events: [] }
    return { state: initialStage(state.stageIndex + 1, { attempts: state.attempts, totalStars: state.totalStars, score: state.score }), events: [] }
  }
  if (state.status !== 'playing') return { state, events: [] }

  const stage = ROCKET_LANDING_STAGES[state.stageIndex]
  if (action.type === 'thrust') {
    if (state.fuel <= 0) return { state, events: [{ type: 'fuel-empty' }] }
    return {
      state: { ...state, velocity: Math.max(-stage.thrustPower, state.velocity - stage.thrustPower), fuel: state.fuel - 1 },
      events: [{ type: 'thrusted' }],
    }
  }

  const velocity = Math.min(6, state.velocity + stage.gravity)
  const altitude = Math.min(stage.maxAltitude, Math.max(0, state.altitude - velocity))
  const ticks = state.ticks + 1
  if (altitude === 0) {
    if (velocity > stage.safeSpeed) {
      return { state: { ...state, status: 'crashed', altitude, velocity, ticks }, events: [{ type: 'crashed', speed: velocity }] }
    }
    const stars = state.fuel >= Math.ceil(stage.fuel / 2) ? 3 : state.fuel > 0 ? 2 : 1
    const finished = state.stageIndex === ROCKET_LANDING_STAGES.length - 1
    return {
      state: {
        ...state,
        status: finished ? 'finished' : 'stage-won',
        altitude,
        velocity,
        ticks,
        stageStars: stars,
        totalStars: state.totalStars + stars,
        score: state.score + stars * 100 + state.fuel * 20,
      },
      events: [{ type: 'fell' }, { type: 'landed', speed: velocity }, ...(finished ? [{ type: 'game-finished' } as const] : [])],
    }
  }
  if (ticks >= stage.timeLimit) {
    return { state: { ...state, status: 'crashed', altitude, velocity, ticks }, events: [{ type: 'crashed', speed: velocity }] }
  }
  return { state: { ...state, altitude, velocity, ticks }, events: [{ type: 'fell' }] }
}

export function calculateRocketLandingResult(state: RocketLandingState) {
  if (state.status !== 'finished') throw new Error('ゲーム終了前です')
  return { score: state.score, stars: state.totalStars, isCleared: true }
}
