export const BALLOON_CLEAR_TARGET = 10
export const BALLOON_GATE_START = 5

export type BalloonFlightState = {
  status: 'playing' | 'finished' | 'lost'
  playerRow: 0 | 1 | 2
  gapRow: 0 | 1 | 2
  gateColumn: number
  hearts: number
  passedCount: number
  score: number
  combo: number
  bestCombo: number
  tickCount: number
}

export type BalloonFlightAction =
  | { type: 'move-up' }
  | { type: 'move-down' }
  | { type: 'tick' }

export type BalloonFlightEvent =
  | { type: 'balloon-moved'; row: 0 | 1 | 2 }
  | { type: 'gate-passed'; combo: number }
  | { type: 'cloud-hit' }
  | { type: 'game-finished' }
  | { type: 'game-lost' }

export type BalloonFlightTransition = {
  state: BalloonFlightState
  events: readonly BalloonFlightEvent[]
}

export type BalloonFlightResult = {
  passedCount: number
  score: number
  bestCombo: number
  isCleared: boolean
}

const randomGap = (random: () => number) =>
  Math.floor(Math.min(Math.max(random(), 0), 0.999999) * 3) as 0 | 1 | 2

export function startBalloonFlight(random: () => number = Math.random): BalloonFlightState {
  return {
    status: 'playing',
    playerRow: 1,
    gapRow: randomGap(random),
    gateColumn: BALLOON_GATE_START,
    hearts: 3,
    passedCount: 0,
    score: 0,
    combo: 0,
    bestCombo: 0,
    tickCount: 0,
  }
}

export function applyBalloonAction(
  state: BalloonFlightState,
  action: BalloonFlightAction,
  random: () => number = Math.random,
): BalloonFlightTransition {
  if (state.status !== 'playing') return { state, events: [] }
  if (action.type === 'move-up' || action.type === 'move-down') {
    const delta = action.type === 'move-up' ? -1 : 1
    const playerRow = Math.max(0, Math.min(2, state.playerRow + delta)) as 0 | 1 | 2
    if (playerRow === state.playerRow) return { state, events: [] }
    return {
      state: { ...state, playerRow },
      events: [{ type: 'balloon-moved', row: playerRow }],
    }
  }

  const gateColumn = state.gateColumn - 1
  if (gateColumn > 1) {
    return { state: { ...state, gateColumn, tickCount: state.tickCount + 1 }, events: [] }
  }

  if (state.playerRow === state.gapRow) {
    const passedCount = state.passedCount + 1
    const combo = state.combo + 1
    const finished = passedCount >= BALLOON_CLEAR_TARGET
    return {
      state: {
        ...state,
        status: finished ? 'finished' : 'playing',
        gapRow: finished ? state.gapRow : randomGap(random),
        gateColumn: BALLOON_GATE_START,
        passedCount,
        score: state.score + 100 + (combo - 1) * 25,
        combo,
        bestCombo: Math.max(state.bestCombo, combo),
        tickCount: state.tickCount + 1,
      },
      events: [
        { type: 'gate-passed', combo },
        ...(finished ? [{ type: 'game-finished' } as const] : []),
      ],
    }
  }

  const hearts = state.hearts - 1
  const lost = hearts <= 0
  return {
    state: {
      ...state,
      status: lost ? 'lost' : 'playing',
      gapRow: lost ? state.gapRow : randomGap(random),
      gateColumn: BALLOON_GATE_START,
      hearts: Math.max(0, hearts),
      combo: 0,
      tickCount: state.tickCount + 1,
    },
    events: [
      { type: 'cloud-hit' },
      ...(lost ? [{ type: 'game-lost' } as const] : []),
    ],
  }
}

export function calculateBalloonFlightResult(state: BalloonFlightState): BalloonFlightResult {
  if (state.status !== 'finished' && state.status !== 'lost') {
    throw new Error('ゲーム終了前は結果を計算できません')
  }
  return {
    passedCount: state.passedCount,
    score: state.score,
    bestCombo: state.bestCombo,
    isCleared: state.status === 'finished',
  }
}
