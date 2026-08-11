export type HelperKind = 'beaver' | 'rabbit' | 'elephant' | 'mole' | 'monkey'
export type ObstacleKind = 'river' | 'fence' | 'boulder' | 'cave' | 'canopy'

export const HELPER_FOR_OBSTACLE: Readonly<Record<ObstacleKind, HelperKind>> = {
  river: 'beaver', fence: 'rabbit', boulder: 'elephant', cave: 'mole', canopy: 'monkey',
}

export const ALL_HELPERS: readonly HelperKind[] = ['beaver', 'rabbit', 'elephant', 'mole', 'monkey']

export type HelperTeamStage = {
  name: string
  obstacles: readonly ObstacleKind[]
  solution: readonly HelperKind[]
}

export const HELPER_TEAM_STAGES: readonly HelperTeamStage[] = [
  { name: 'かわを わたろう', obstacles: ['river'], solution: ['beaver'] },
  { name: 'さくと おおいわ', obstacles: ['fence', 'boulder'], solution: ['rabbit', 'elephant'] },
  { name: 'ほらあなから かわへ', obstacles: ['cave', 'river'], solution: ['mole', 'beaver'] },
  { name: 'もりの みっつの ピンチ', obstacles: ['boulder', 'fence', 'river'], solution: ['elephant', 'rabbit', 'beaver'] },
  { name: 'ジャングル たんけん', obstacles: ['canopy', 'cave', 'boulder', 'river'], solution: ['monkey', 'mole', 'elephant', 'beaver'] },
  { name: 'みんなで だいぼうけん', obstacles: ['river', 'canopy', 'fence', 'cave', 'boulder'], solution: ['beaver', 'monkey', 'rabbit', 'mole', 'elephant'] },
  { name: 'いわやま たんけん', obstacles: ['boulder', 'cave', 'canopy', 'fence', 'river'], solution: ['elephant', 'mole', 'monkey', 'rabbit', 'beaver'] },
  { name: 'かわべの だいピンチ', obstacles: ['river', 'fence', 'canopy', 'boulder', 'cave'], solution: ['beaver', 'rabbit', 'monkey', 'elephant', 'mole'] },
  { name: 'もりの まわりみち', obstacles: ['canopy', 'river', 'cave', 'fence', 'boulder'], solution: ['monkey', 'beaver', 'mole', 'rabbit', 'elephant'] },
  { name: 'どうくつの おくへ', obstacles: ['cave', 'boulder', 'river', 'canopy', 'fence'], solution: ['mole', 'elephant', 'beaver', 'monkey', 'rabbit'] },
  { name: 'ゆうやけ レスキュー', obstacles: ['fence', 'canopy', 'river', 'boulder', 'cave'], solution: ['rabbit', 'monkey', 'beaver', 'elephant', 'mole'] },
  { name: 'おたすけ チャンピオン', obstacles: ['boulder', 'river', 'fence', 'cave', 'canopy'], solution: ['elephant', 'beaver', 'rabbit', 'mole', 'monkey'] },
]

export type HelperTeamState = {
  status: 'planning' | 'failed' | 'stage-won' | 'finished'
  stageIndex: number
  plan: readonly HelperKind[]
  passedCount: number
  attempts: number
  stageStars: number
  totalStars: number
  score: number
}

export type HelperTeamAction =
  | { type: 'add-helper'; helper: HelperKind }
  | { type: 'remove-helper'; index: number }
  | { type: 'run-team' }
  | { type: 'retry' }
  | { type: 'next-stage' }

export type HelperTeamEvent =
  | { type: 'helper-added'; helper: HelperKind }
  | { type: 'helper-blocked'; obstacleIndex: number; helper: HelperKind | null }
  | { type: 'stage-won'; stars: number }
  | { type: 'game-finished' }

export type HelperTeamTransition = { state: HelperTeamState; events: readonly HelperTeamEvent[] }
export type HelperTeamResult = { score: number; totalStars: number; isCleared: boolean }

export function startHelperTeam(stageIndex = 0): HelperTeamState {
  if (!HELPER_TEAM_STAGES[stageIndex]) throw new Error('存在しないステージです')
  return {
    status: 'planning', stageIndex, plan: [], passedCount: 0, attempts: 0,
    stageStars: 0, totalStars: 0, score: 0,
  }
}

const starsFor = (attempts: number) => attempts <= 1 ? 3 : attempts === 2 ? 2 : 1

export function applyHelperTeamAction(state: HelperTeamState, action: HelperTeamAction): HelperTeamTransition {
  const stage = HELPER_TEAM_STAGES[state.stageIndex]
  if (action.type === 'next-stage') {
    if (state.status !== 'stage-won') return { state, events: [] }
    if (!HELPER_TEAM_STAGES[state.stageIndex + 1]) return { state, events: [] }
    return {
      state: { ...state, status: 'planning', stageIndex: state.stageIndex + 1, plan: [], passedCount: 0, attempts: 0, stageStars: 0 },
      events: [],
    }
  }
  if (action.type === 'retry') {
    if (state.status !== 'failed') return { state, events: [] }
    return { state: { ...state, status: 'planning', plan: [], passedCount: 0 }, events: [] }
  }
  if (state.status !== 'planning') return { state, events: [] }

  if (action.type === 'add-helper') {
    if (state.plan.includes(action.helper) || state.plan.length >= stage.obstacles.length) return { state, events: [] }
    return { state: { ...state, plan: [...state.plan, action.helper] }, events: [{ type: 'helper-added', helper: action.helper }] }
  }
  if (action.type === 'remove-helper') {
    if (action.index < 0 || action.index >= state.plan.length) return { state, events: [] }
    return { state: { ...state, plan: state.plan.filter((_, index) => index !== action.index) }, events: [] }
  }

  const blockedIndex = stage.obstacles.findIndex((obstacle, index) => state.plan[index] !== HELPER_FOR_OBSTACLE[obstacle])
  const attempts = state.attempts + 1
  if (blockedIndex !== -1) {
    return {
      state: { ...state, status: 'failed', passedCount: blockedIndex, attempts },
      events: [{ type: 'helper-blocked', obstacleIndex: blockedIndex, helper: state.plan[blockedIndex] ?? null }],
    }
  }

  const stageStars = starsFor(attempts)
  const finalStage = state.stageIndex === HELPER_TEAM_STAGES.length - 1
  return {
    state: {
      ...state, status: finalStage ? 'finished' : 'stage-won', passedCount: stage.obstacles.length,
      attempts, stageStars, totalStars: state.totalStars + stageStars,
      score: state.score + 500 + stageStars * 100,
    },
    events: [{ type: 'stage-won', stars: stageStars }, ...(finalStage ? [{ type: 'game-finished' } as const] : [])],
  }
}

export function calculateHelperTeamResult(state: HelperTeamState): HelperTeamResult {
  if (state.status !== 'finished') throw new Error('ゲーム終了前は結果を計算できません')
  return { score: state.score, totalStars: state.totalStars, isCleared: true }
}
