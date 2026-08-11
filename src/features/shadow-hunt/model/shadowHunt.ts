export const SHADOW_HUNT_CLEAR_TARGET = 6
export const SHADOW_HUNT_FIELD_SIZE = 5

export const SHADOW_MONSTERS = [
  { id: 'slime', name: 'スライム', emoji: '👾', rarity: 1 },
  { id: 'chick', name: 'ひよこ', emoji: '🐣', rarity: 1 },
  { id: 'rabbit', name: 'うさぎ', emoji: '🐰', rarity: 1 },
  { id: 'frog', name: 'かえる', emoji: '🐸', rarity: 1 },
  { id: 'cat', name: 'ねこ', emoji: '🐱', rarity: 2 },
  { id: 'owl', name: 'ふくろう', emoji: '🦉', rarity: 2 },
  { id: 'fox', name: 'きつね', emoji: '🦊', rarity: 2 },
  { id: 'octopus', name: 'たこ', emoji: '🐙', rarity: 2 },
  { id: 'dragon', name: 'ドラゴン', emoji: '🐲', rarity: 3 },
  { id: 'unicorn', name: 'ユニコーン', emoji: '🦄', rarity: 3 },
] as const

export type ShadowMonsterId = typeof SHADOW_MONSTERS[number]['id']

export type ShadowHuntState = {
  status: 'playing' | 'finished'
  durationSeconds: number
  timeLeft: number
  targetMonsterId: ShadowMonsterId
  fieldMonsterIds: readonly ShadowMonsterId[]
  flashlightEnergy: number
  score: number
  combo: number
  bestCombo: number
  captureCount: number
  missedCount: number
  capturedMonsterIds: readonly ShadowMonsterId[]
}

export type ShadowHuntAction =
  | { type: 'capture'; slotIndex: number }
  | { type: 'tick' }

export type ShadowHuntEvent =
  | { type: 'monster-captured'; monsterId: ShadowMonsterId; combo: number }
  | { type: 'flashlight-dim' }
  | { type: 'shadow-escaped' }
  | { type: 'game-finished' }

export type ShadowHuntTransition = {
  state: ShadowHuntState
  events: readonly ShadowHuntEvent[]
}

export type ShadowHuntResult = {
  captureCount: number
  discoveredCount: number
  score: number
  bestCombo: number
  isCleared: boolean
}

const randomIndex = (length: number, random: () => number) =>
  Math.floor(Math.min(Math.max(random(), 0), 0.999999) * length)

const createEncounter = (random: () => number) => {
  const targetIndex = randomIndex(SHADOW_MONSTERS.length, random)
  const targetMonsterId = SHADOW_MONSTERS[targetIndex].id
  const distractors = Array.from({ length: SHADOW_HUNT_FIELD_SIZE - 1 }, (_, offset) =>
    SHADOW_MONSTERS[(targetIndex + offset + 1) % SHADOW_MONSTERS.length].id,
  )
  const targetSlot = randomIndex(SHADOW_HUNT_FIELD_SIZE, random)
  const fieldMonsterIds = [...distractors]
  fieldMonsterIds.splice(targetSlot, 0, targetMonsterId)
  return { targetMonsterId, fieldMonsterIds }
}

export function startShadowHunt(
  options: { durationSeconds?: number } = {},
  random: () => number = Math.random,
): ShadowHuntState {
  const durationSeconds = Math.max(1, Math.floor(options.durationSeconds ?? 45))
  return {
    status: 'playing',
    durationSeconds,
    timeLeft: durationSeconds,
    ...createEncounter(random),
    flashlightEnergy: 3,
    score: 0,
    combo: 0,
    bestCombo: 0,
    captureCount: 0,
    missedCount: 0,
    capturedMonsterIds: [],
  }
}

export function applyShadowHuntAction(
  state: ShadowHuntState,
  action: ShadowHuntAction,
  random: () => number = Math.random,
): ShadowHuntTransition {
  if (state.status !== 'playing') return { state, events: [] }

  if (action.type === 'tick') {
    const timeLeft = Math.max(0, state.timeLeft - 1)
    if (timeLeft === 0) {
      return {
        state: { ...state, timeLeft, status: 'finished' },
        events: [{ type: 'game-finished' }],
      }
    }
    return { state: { ...state, timeLeft }, events: [] }
  }

  const selectedMonsterId = state.fieldMonsterIds[action.slotIndex]
  if (!selectedMonsterId) return { state, events: [] }

  if (selectedMonsterId === state.targetMonsterId) {
    const combo = state.combo + 1
    const captureCount = state.captureCount + 1
    const monster = SHADOW_MONSTERS.find(({ id }) => id === selectedMonsterId)
    const score = state.score + (monster?.rarity ?? 1) * 100 + (combo - 1) * 20
    const capturedMonsterIds = state.capturedMonsterIds.includes(selectedMonsterId)
      ? state.capturedMonsterIds
      : [...state.capturedMonsterIds, selectedMonsterId]
    const finished = captureCount >= SHADOW_HUNT_CLEAR_TARGET
    return {
      state: {
        ...state,
        ...(finished ? {} : createEncounter(random)),
        status: finished ? 'finished' : 'playing',
        flashlightEnergy: 3,
        score,
        combo,
        bestCombo: Math.max(state.bestCombo, combo),
        captureCount,
        capturedMonsterIds,
      },
      events: [
        { type: 'monster-captured', monsterId: selectedMonsterId, combo },
        ...(finished ? [{ type: 'game-finished' } as const] : []),
      ],
    }
  }

  const flashlightEnergy = state.flashlightEnergy - 1
  if (flashlightEnergy <= 0) {
    return {
      state: {
        ...state,
        ...createEncounter(random),
        flashlightEnergy: 3,
        combo: 0,
        missedCount: state.missedCount + 1,
      },
      events: [{ type: 'shadow-escaped' }],
    }
  }

  return {
    state: { ...state, flashlightEnergy, combo: 0 },
    events: [{ type: 'flashlight-dim' }],
  }
}

export function calculateShadowHuntResult(state: ShadowHuntState): ShadowHuntResult {
  if (state.status !== 'finished') throw new Error('ゲーム終了前は結果を計算できません')
  return {
    captureCount: state.captureCount,
    discoveredCount: state.capturedMonsterIds.length,
    score: state.score,
    bestCombo: state.bestCombo,
    isCleared: state.captureCount >= SHADOW_HUNT_CLEAR_TARGET,
  }
}
