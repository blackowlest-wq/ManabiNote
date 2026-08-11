export type FireflyStage = {
  name: string
  size: 2 | 3
  solution: readonly number[]
}

export const FIREFLY_STAGES: readonly FireflyStage[] = [
  { name: 'はじめての ほたる', size: 2, solution: [0] },
  { name: 'ななめの ほたる', size: 2, solution: [0, 3] },
  { name: 'まんなか ぴかり', size: 3, solution: [4] },
  { name: 'よすみの よる', size: 3, solution: [0, 2, 6, 8] },
  { name: 'じゅうじの ひかり', size: 3, solution: [1, 3, 5, 7] },
  { name: 'ほたるの おまつり', size: 3, solution: [0, 2, 4, 6, 8] },
]

export type FireflyLightsState = {
  status: 'playing' | 'stage-won' | 'finished'
  stageIndex: number
  lights: readonly boolean[]
  moveCount: number
  stageStars: number
  totalStars: number
  score: number
}

export type FireflyLightsAction =
  | { type: 'tap-firefly'; index: number }
  | { type: 'reset-stage' }
  | { type: 'next-stage' }

export type FireflyLightsEvent =
  | { type: 'lights-changed'; indexes: readonly number[] }
  | { type: 'stage-won'; stars: number }
  | { type: 'game-finished' }

export type FireflyLightsTransition = {
  state: FireflyLightsState
  events: readonly FireflyLightsEvent[]
}

export type FireflyLightsResult = {
  score: number
  totalStars: number
  isCleared: boolean
}

const affectedIndexes = (size: number, index: number) => {
  const row = Math.floor(index / size)
  const column = index % size
  return [
    [row, column],
    [row - 1, column],
    [row + 1, column],
    [row, column - 1],
    [row, column + 1],
  ]
    .filter(([nextRow, nextColumn]) => nextRow >= 0 && nextRow < size && nextColumn >= 0 && nextColumn < size)
    .map(([nextRow, nextColumn]) => nextRow * size + nextColumn)
}

const toggleAt = (lights: readonly boolean[], size: number, index: number) => {
  const affected = new Set(affectedIndexes(size, index))
  return lights.map((light, lightIndex) => affected.has(lightIndex) ? !light : light)
}

const initialLights = (stage: FireflyStage) => {
  let lights: readonly boolean[] = Array.from({ length: stage.size * stage.size }, () => true)
  for (const index of stage.solution) lights = toggleAt(lights, stage.size, index)
  return lights
}

export function startFireflyLights(stageIndex = 0): FireflyLightsState {
  const stage = FIREFLY_STAGES[stageIndex]
  if (!stage) throw new Error('存在しないステージです')
  return {
    status: 'playing',
    stageIndex,
    lights: initialLights(stage),
    moveCount: 0,
    stageStars: 0,
    totalStars: 0,
    score: 0,
  }
}

const starsFor = (stage: FireflyStage, moves: number) => {
  if (moves <= stage.solution.length) return 3
  if (moves <= stage.solution.length + 2) return 2
  return 1
}

export function applyFireflyAction(
  state: FireflyLightsState,
  action: FireflyLightsAction,
): FireflyLightsTransition {
  const stage = FIREFLY_STAGES[state.stageIndex]
  if (action.type === 'next-stage') {
    if (state.status !== 'stage-won') return { state, events: [] }
    const nextStage = FIREFLY_STAGES[state.stageIndex + 1]
    return {
      state: {
        ...state,
        status: 'playing',
        stageIndex: state.stageIndex + 1,
        lights: initialLights(nextStage),
        moveCount: 0,
        stageStars: 0,
      },
      events: [],
    }
  }

  if (state.status !== 'playing') return { state, events: [] }
  if (action.type === 'reset-stage') {
    return { state: { ...state, lights: initialLights(stage), moveCount: 0 }, events: [] }
  }
  if (action.index < 0 || action.index >= state.lights.length) return { state, events: [] }

  const indexes = affectedIndexes(stage.size, action.index)
  const lights = toggleAt(state.lights, stage.size, action.index)
  const moveCount = state.moveCount + 1
  const won = lights.every(Boolean)
  if (!won) {
    return {
      state: { ...state, lights, moveCount },
      events: [{ type: 'lights-changed', indexes }],
    }
  }

  const stageStars = starsFor(stage, moveCount)
  const finalStage = state.stageIndex === FIREFLY_STAGES.length - 1
  return {
    state: {
      ...state,
      status: finalStage ? 'finished' : 'stage-won',
      lights,
      moveCount,
      stageStars,
      totalStars: state.totalStars + stageStars,
      score: state.score + 500 + stageStars * 100,
    },
    events: [
      { type: 'lights-changed', indexes },
      { type: 'stage-won', stars: stageStars },
      ...(finalStage ? [{ type: 'game-finished' } as const] : []),
    ],
  }
}

export function calculateFireflyLightsResult(state: FireflyLightsState): FireflyLightsResult {
  if (state.status !== 'finished') throw new Error('ゲーム終了前は結果を計算できません')
  return { score: state.score, totalStars: state.totalStars, isCleared: true }
}
