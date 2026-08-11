export type BridgeLog = {
  id: string
  length: 1 | 2 | 3
  color: 'light' | 'medium' | 'dark'
}

export type BridgeStage = {
  name: string
  span: number
  logs: readonly BridgeLog[]
  solution: readonly string[]
}

export const BRIDGE_STAGES: readonly BridgeStage[] = [
  {
    name: 'ちいさな おがわ', span: 3,
    logs: [{ id: 's1-a', length: 1, color: 'light' }, { id: 's1-b', length: 2, color: 'medium' }],
    solution: ['s1-a', 's1-b'],
  },
  {
    name: 'ふたつの ながい まるた', span: 4,
    logs: [{ id: 's2-a', length: 1, color: 'light' }, { id: 's2-b', length: 2, color: 'medium' }, { id: 's2-c', length: 2, color: 'dark' }],
    solution: ['s2-b', 's2-c'],
  },
  {
    name: 'おおきな かわ', span: 5,
    logs: [{ id: 's3-a', length: 1, color: 'light' }, { id: 's3-b', length: 2, color: 'medium' }, { id: 's3-c', length: 3, color: 'dark' }, { id: 's3-d', length: 2, color: 'light' }],
    solution: ['s3-b', 's3-c'],
  },
  {
    name: 'いろいろ まるた', span: 6,
    logs: [{ id: 's4-a', length: 1, color: 'light' }, { id: 's4-b', length: 2, color: 'medium' }, { id: 's4-c', length: 2, color: 'dark' }, { id: 's4-d', length: 3, color: 'medium' }],
    solution: ['s4-a', 's4-b', 's4-d'],
  },
  {
    name: 'ながい ながい かわ', span: 7,
    logs: [{ id: 's5-a', length: 1, color: 'light' }, { id: 's5-b', length: 2, color: 'medium' }, { id: 's5-c', length: 3, color: 'dark' }, { id: 's5-d', length: 3, color: 'medium' }, { id: 's5-e', length: 2, color: 'light' }],
    solution: ['s5-a', 's5-c', 's5-d'],
  },
  {
    name: 'たきの まえ', span: 8,
    logs: [{ id: 's6-a', length: 1, color: 'light' }, { id: 's6-b', length: 1, color: 'medium' }, { id: 's6-c', length: 2, color: 'dark' }, { id: 's6-d', length: 3, color: 'medium' }, { id: 's6-e', length: 3, color: 'dark' }],
    solution: ['s6-c', 's6-d', 's6-e'],
  },
]

export type BridgeBuilderState = {
  status: 'playing' | 'stage-won' | 'finished'
  stageIndex: number
  placedLogIds: readonly string[]
  builtLength: number
  collapseCount: number
  stageStars: number
  totalStars: number
  score: number
}

export type BridgeBuilderAction =
  | { type: 'place-log'; logId: string }
  | { type: 'remove-last' }
  | { type: 'reset-stage' }
  | { type: 'next-stage' }

export type BridgeBuilderEvent =
  | { type: 'log-placed'; logId: string }
  | { type: 'log-removed'; logId: string }
  | { type: 'bridge-collapsed' }
  | { type: 'stage-won'; stars: number }
  | { type: 'game-finished' }

export type BridgeBuilderTransition = {
  state: BridgeBuilderState
  events: readonly BridgeBuilderEvent[]
}

export type BridgeBuilderResult = {
  score: number
  totalStars: number
  isCleared: boolean
}

export function startBridgeBuilder(stageIndex = 0): BridgeBuilderState {
  if (!BRIDGE_STAGES[stageIndex]) throw new Error('存在しないステージです')
  return {
    status: 'playing',
    stageIndex,
    placedLogIds: [],
    builtLength: 0,
    collapseCount: 0,
    stageStars: 0,
    totalStars: 0,
    score: 0,
  }
}

const starsFor = (state: BridgeBuilderState, placedCount: number) => {
  const optimalCount = BRIDGE_STAGES[state.stageIndex].solution.length
  if (state.collapseCount === 0 && placedCount <= optimalCount) return 3
  if (state.collapseCount <= 1) return 2
  return 1
}

export function applyBridgeAction(
  state: BridgeBuilderState,
  action: BridgeBuilderAction,
): BridgeBuilderTransition {
  const stage = BRIDGE_STAGES[state.stageIndex]

  if (action.type === 'next-stage') {
    if (state.status !== 'stage-won') return { state, events: [] }
    return {
      state: {
        ...state,
        status: 'playing',
        stageIndex: state.stageIndex + 1,
        placedLogIds: [],
        builtLength: 0,
        collapseCount: 0,
        stageStars: 0,
      },
      events: [],
    }
  }

  if (state.status !== 'playing') return { state, events: [] }

  if (action.type === 'reset-stage') {
    return {
      state: { ...state, placedLogIds: [], builtLength: 0, collapseCount: state.collapseCount + 1 },
      events: [],
    }
  }

  if (action.type === 'remove-last') {
    const logId = state.placedLogIds[state.placedLogIds.length - 1]
    if (!logId) return { state, events: [] }
    const log = stage.logs.find(({ id }) => id === logId)
    return {
      state: {
        ...state,
        placedLogIds: state.placedLogIds.slice(0, -1),
        builtLength: state.builtLength - (log?.length ?? 0),
      },
      events: [{ type: 'log-removed', logId }],
    }
  }

  if (state.placedLogIds.includes(action.logId)) return { state, events: [] }
  const log = stage.logs.find(({ id }) => id === action.logId)
  if (!log) return { state, events: [] }
  const builtLength = state.builtLength + log.length
  if (builtLength > stage.span) {
    return {
      state: {
        ...state,
        placedLogIds: [],
        builtLength: 0,
        collapseCount: state.collapseCount + 1,
      },
      events: [{ type: 'bridge-collapsed' }],
    }
  }

  const placedLogIds = [...state.placedLogIds, log.id]
  if (builtLength < stage.span) {
    return {
      state: { ...state, placedLogIds, builtLength },
      events: [{ type: 'log-placed', logId: log.id }],
    }
  }

  const stageStars = starsFor(state, placedLogIds.length)
  const finalStage = state.stageIndex === BRIDGE_STAGES.length - 1
  return {
    state: {
      ...state,
      status: finalStage ? 'finished' : 'stage-won',
      placedLogIds,
      builtLength,
      stageStars,
      totalStars: state.totalStars + stageStars,
      score: state.score + 500 + stageStars * 100,
    },
    events: [
      { type: 'log-placed', logId: log.id },
      { type: 'stage-won', stars: stageStars },
      ...(finalStage ? [{ type: 'game-finished' } as const] : []),
    ],
  }
}

export function calculateBridgeBuilderResult(state: BridgeBuilderState): BridgeBuilderResult {
  if (state.status !== 'finished') throw new Error('ゲーム終了前は結果を計算できません')
  return { score: state.score, totalStars: state.totalStars, isCleared: true }
}
