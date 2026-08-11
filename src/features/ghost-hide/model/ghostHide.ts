export type GhostColor = 'pink' | 'blue' | 'green' | 'orange'
export type GhostFace = 'happy' | 'sleepy' | 'surprised'
export type GhostHat = 'star' | 'crown' | 'bow' | 'none'

export type HideGhost = {
  id: string
  color: GhostColor
  face: GhostFace
  hat: GhostHat
}

export type GhostHideStage = {
  name: string
  target: HideGhost
  crowdSize: number
  targetPosition: number
  timeLimit: number
}

const ghost = (color: GhostColor, face: GhostFace, hat: GhostHat): HideGhost => ({
  id: `${color}-${face}-${hat}`, color, face, hat,
})

export const GHOST_HIDE_STAGES: readonly GhostHideStage[] = [
  { name: 'はじめての かくれんぼ', target: ghost('pink', 'happy', 'star'), crowdSize: 4, targetPosition: 1, timeLimit: 18 },
  { name: 'ねむねむ おばけ', target: ghost('blue', 'sleepy', 'crown'), crowdSize: 5, targetPosition: 3, timeLimit: 17 },
  { name: 'びっくり おばけ', target: ghost('green', 'surprised', 'bow'), crowdSize: 6, targetPosition: 0, timeLimit: 16 },
  { name: 'ぼうしは どこ？', target: ghost('orange', 'happy', 'none'), crowdSize: 7, targetPosition: 5, timeLimit: 15 },
  { name: 'そっくりの もり', target: ghost('pink', 'sleepy', 'crown'), crowdSize: 8, targetPosition: 2, timeLimit: 14 },
  { name: 'おばけの おまつり', target: ghost('blue', 'surprised', 'star'), crowdSize: 9, targetPosition: 7, timeLimit: 13 },
  { name: 'オレンジの ひろば', target: ghost('orange', 'sleepy', 'bow'), crowdSize: 9, targetPosition: 4, timeLimit: 13 },
  { name: 'みどりの よる', target: ghost('green', 'happy', 'crown'), crowdSize: 10, targetPosition: 8, timeLimit: 12 },
  { name: 'リボンの かくれみち', target: ghost('pink', 'surprised', 'bow'), crowdSize: 10, targetPosition: 1, timeLimit: 12 },
  { name: 'ぼうしの おおひろば', target: ghost('blue', 'happy', 'none'), crowdSize: 11, targetPosition: 6, timeLimit: 11 },
  { name: 'そっくり おばけやしき', target: ghost('green', 'sleepy', 'star'), crowdSize: 11, targetPosition: 9, timeLimit: 11 },
  { name: 'かくれんぼ チャンピオン', target: ghost('orange', 'surprised', 'crown'), crowdSize: 12, targetPosition: 5, timeLimit: 10 },
]

const COLORS: readonly GhostColor[] = ['pink', 'blue', 'green', 'orange']
const FACES: readonly GhostFace[] = ['happy', 'sleepy', 'surprised']
const HATS: readonly GhostHat[] = ['star', 'crown', 'bow', 'none']

const differenceCount = (candidate: HideGhost, target: HideGhost) =>
  Number(candidate.color !== target.color) + Number(candidate.face !== target.face) + Number(candidate.hat !== target.hat)

const makeCrowd = (stage: GhostHideStage): readonly HideGhost[] => {
  const decoys = COLORS.flatMap((color) => FACES.flatMap((face) => HATS.map((hat) => ghost(color, face, hat))))
    .filter((candidate) => candidate.id !== stage.target.id)
    .sort((first, second) => differenceCount(first, stage.target) - differenceCount(second, stage.target) || first.id.localeCompare(second.id))
    .slice(0, stage.crowdSize - 1)
  const crowd = [...decoys]
  crowd.splice(stage.targetPosition, 0, stage.target)
  return crowd
}

export type GhostHideState = {
  status: 'memorizing' | 'hunting' | 'round-won' | 'finished' | 'lost'
  roundIndex: number
  target: HideGhost
  crowd: readonly HideGhost[]
  timeLeft: number
  hearts: number
  combo: number
  foundCount: number
  score: number
}

export type GhostHideAction =
  | { type: 'hide-target' }
  | { type: 'choose-ghost'; index: number }
  | { type: 'peek' }
  | { type: 'tick'; seconds?: number }
  | { type: 'next-round' }

export type GhostHideEvent =
  | { type: 'target-hidden' }
  | { type: 'target-found'; combo: number }
  | { type: 'decoy-chosen' }
  | { type: 'peeked' }
  | { type: 'round-lost' }
  | { type: 'game-finished' }

export type GhostHideTransition = { state: GhostHideState; events: readonly GhostHideEvent[] }
export type GhostHideResult = { score: number; foundCount: number; isCleared: boolean }

export function startGhostHide(roundIndex = 0): GhostHideState {
  const stage = GHOST_HIDE_STAGES[roundIndex]
  if (!stage) throw new Error('存在しないステージです')
  return {
    status: 'memorizing', roundIndex, target: stage.target, crowd: makeCrowd(stage),
    timeLeft: stage.timeLimit, hearts: 3, combo: 0, foundCount: 0, score: 0,
  }
}

export function applyGhostHideAction(state: GhostHideState, action: GhostHideAction): GhostHideTransition {
  if (action.type === 'next-round') {
    if (state.status !== 'round-won') return { state, events: [] }
    const nextStage = GHOST_HIDE_STAGES[state.roundIndex + 1]
    if (!nextStage) return { state, events: [] }
    return {
      state: {
        ...state, status: 'memorizing', roundIndex: state.roundIndex + 1,
        target: nextStage.target, crowd: makeCrowd(nextStage), timeLeft: nextStage.timeLimit,
      },
      events: [],
    }
  }
  if (state.status === 'finished' || state.status === 'lost' || state.status === 'round-won') return { state, events: [] }

  if (action.type === 'hide-target') {
    if (state.status !== 'memorizing') return { state, events: [] }
    return { state: { ...state, status: 'hunting' }, events: [{ type: 'target-hidden' }] }
  }
  if (action.type === 'peek') {
    if (state.status !== 'hunting') return { state, events: [] }
    const timeLeft = Math.max(0, state.timeLeft - 3)
    if (timeLeft === 0) return { state: { ...state, status: 'lost', timeLeft, combo: 0 }, events: [{ type: 'round-lost' }] }
    return { state: { ...state, status: 'memorizing', timeLeft }, events: [{ type: 'peeked' }] }
  }
  if (action.type === 'tick') {
    if (state.status !== 'hunting') return { state, events: [] }
    const timeLeft = Math.max(0, state.timeLeft - (action.seconds ?? 1))
    if (timeLeft === 0) return { state: { ...state, status: 'lost', timeLeft, combo: 0 }, events: [{ type: 'round-lost' }] }
    return { state: { ...state, timeLeft }, events: [] }
  }
  if (state.status !== 'hunting') return { state, events: [] }

  const chosen = state.crowd[action.index]
  if (!chosen || chosen.id !== state.target.id) {
    const hearts = state.hearts - 1
    const lost = hearts <= 0
    return {
      state: { ...state, status: lost ? 'lost' : 'hunting', hearts: Math.max(0, hearts), combo: 0 },
      events: [{ type: 'decoy-chosen' }, ...(lost ? [{ type: 'round-lost' } as const] : [])],
    }
  }

  const combo = state.combo + 1
  const foundCount = state.foundCount + 1
  const score = state.score + 400 + state.timeLeft * 10 + combo * 100
  const finalRound = state.roundIndex === GHOST_HIDE_STAGES.length - 1
  return {
    state: { ...state, status: finalRound ? 'finished' : 'round-won', combo, foundCount, score },
    events: [{ type: 'target-found', combo }, ...(finalRound ? [{ type: 'game-finished' } as const] : [])],
  }
}

export function calculateGhostHideResult(state: GhostHideState): GhostHideResult {
  if (state.status !== 'finished' && state.status !== 'lost') throw new Error('ゲーム終了前は結果を計算できません')
  return { score: state.score, foundCount: state.foundCount, isCleared: state.status === 'finished' }
}
