export const COPY_BEAT_PADS = ['sun', 'moon', 'star', 'leaf'] as const
export const COPY_BEAT_CLEAR_ROUND = 12

export type CopyBeatPad = typeof COPY_BEAT_PADS[number]

export type CopyBeatState = {
  status: 'showing' | 'input' | 'round-won' | 'finished' | 'lost'
  sequence: readonly CopyBeatPad[]
  inputIndex: number
  round: number
  hearts: number
  score: number
  combo: number
  bestCombo: number
}

export type CopyBeatAction =
  | { type: 'finish-showing' }
  | { type: 'tap-pad'; pad: CopyBeatPad }
  | { type: 'next-round' }

export type CopyBeatEvent =
  | { type: 'beat-copied'; pad: CopyBeatPad }
  | { type: 'round-copied'; round: number }
  | { type: 'pattern-replay' }
  | { type: 'game-finished' }
  | { type: 'game-lost' }

export type CopyBeatTransition = {
  state: CopyBeatState
  events: readonly CopyBeatEvent[]
}

export type CopyBeatResult = {
  round: number
  score: number
  bestCombo: number
  hearts: number
  isCleared: boolean
}

const randomPad = (random: () => number): CopyBeatPad => {
  const index = Math.floor(Math.min(Math.max(random(), 0), 0.999999) * COPY_BEAT_PADS.length)
  return COPY_BEAT_PADS[index]
}

export function startCopyBeat(random: () => number = Math.random): CopyBeatState {
  return {
    status: 'showing',
    sequence: [randomPad(random)],
    inputIndex: 0,
    round: 1,
    hearts: 3,
    score: 0,
    combo: 0,
    bestCombo: 0,
  }
}

export function applyCopyBeatAction(
  state: CopyBeatState,
  action: CopyBeatAction,
  random: () => number = Math.random,
): CopyBeatTransition {
  if (action.type === 'finish-showing') {
    if (state.status !== 'showing') return { state, events: [] }
    return { state: { ...state, status: 'input', inputIndex: 0 }, events: [] }
  }

  if (action.type === 'next-round') {
    if (state.status !== 'round-won') return { state, events: [] }
    return {
      state: {
        ...state,
        status: 'showing',
        sequence: [...state.sequence, randomPad(random)],
        inputIndex: 0,
        round: state.round + 1,
      },
      events: [],
    }
  }

  if (state.status !== 'input') return { state, events: [] }
  const expected = state.sequence[state.inputIndex]
  if (action.pad !== expected) {
    const hearts = state.hearts - 1
    if (hearts <= 0) {
      return {
        state: { ...state, status: 'lost', hearts: 0, combo: 0, inputIndex: 0 },
        events: [{ type: 'game-lost' }],
      }
    }
    return {
      state: { ...state, status: 'showing', hearts, combo: 0, inputIndex: 0 },
      events: [{ type: 'pattern-replay' }],
    }
  }

  const inputIndex = state.inputIndex + 1
  if (inputIndex < state.sequence.length) {
    return {
      state: { ...state, inputIndex },
      events: [{ type: 'beat-copied', pad: action.pad }],
    }
  }

  const combo = state.combo + 1
  const finished = state.round >= COPY_BEAT_CLEAR_ROUND
  return {
    state: {
      ...state,
      status: finished ? 'finished' : 'round-won',
      inputIndex: 0,
      score: state.score + state.round * 100 + (combo - 1) * 25,
      combo,
      bestCombo: Math.max(state.bestCombo, combo),
    },
    events: [
      { type: 'round-copied', round: state.round },
      ...(finished ? [{ type: 'game-finished' } as const] : []),
    ],
  }
}

export function calculateCopyBeatResult(state: CopyBeatState): CopyBeatResult {
  if (state.status !== 'finished' && state.status !== 'lost') {
    throw new Error('ゲーム終了前は結果を計算できません')
  }
  return {
    round: state.round,
    score: state.score,
    bestCombo: state.bestCombo,
    hearts: state.hearts,
    isCleared: state.status === 'finished',
  }
}
