import type { StageResult } from './rescueMaze'

const RESCUE_PROGRESS_KEY = 'manabinote.rescue-maze-progress.v1'

export type RescueProgress = {
  unlockedStageIds: readonly string[]
  bestStampCountByStage: Record<string, number>
  bestMovesByStage: Record<string, number>
  collectedTreasureIds: readonly string[]
}

export type ProgressWriteResult = { ok: true; progress: RescueProgress } | { ok: false; reason: 'unavailable' | 'quota' }

const getDefaultStorage = (): Storage | undefined => {
  try {
    return typeof window === 'undefined' ? undefined : window.localStorage
  } catch {
    return undefined
  }
}

const emptyProgress = (stageIds: readonly string[]): RescueProgress => ({
  unlockedStageIds: stageIds[0] ? [stageIds[0]] : [],
  bestStampCountByStage: {},
  bestMovesByStage: {},
  collectedTreasureIds: [],
})

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value)

const isUniqueStringArray = (value: unknown): value is string[] =>
  Array.isArray(value) && value.every((item) => typeof item === 'string') && new Set(value).size === value.length

const isStageNumberRecord = (
  value: unknown,
  stageIds: readonly string[],
  isValidNumber: (number: number) => boolean,
): value is Record<string, number> => isRecord(value) && Object.entries(value).every(
  ([stageId, number]) => stageIds.includes(stageId) && typeof number === 'number' && isValidNumber(number),
)

export function loadRescueProgress(
  storage: Storage = getDefaultStorage() as Storage,
  stageIds: readonly string[],
): RescueProgress {
  if (!storage) return emptyProgress(stageIds)

  try {
    const saved = storage.getItem(RESCUE_PROGRESS_KEY)
    if (!saved) return emptyProgress(stageIds)
    const parsed: unknown = JSON.parse(saved)
    if (!isRecord(parsed)) return emptyProgress(stageIds)
    const unlockedStageIds = parsed.unlockedStageIds
    const bestStampCountByStage = parsed.bestStampCountByStage
    const bestMovesByStage = parsed.bestMovesByStage
    const collectedTreasureIds = parsed.collectedTreasureIds
    if (
      !isUniqueStringArray(unlockedStageIds) ||
      unlockedStageIds.some((stageId) => !stageIds.includes(stageId)) ||
      (stageIds[0] !== undefined && !unlockedStageIds.includes(stageIds[0])) ||
      !isStageNumberRecord(bestStampCountByStage, stageIds, (number) => Number.isInteger(number) && number >= 1 && number <= 3) ||
      !isStageNumberRecord(bestMovesByStage, stageIds, (number) => Number.isInteger(number) && number >= 1) ||
      !isUniqueStringArray(collectedTreasureIds)
    ) return emptyProgress(stageIds)
    return { unlockedStageIds, bestStampCountByStage, bestMovesByStage, collectedTreasureIds }
  } catch {
    return emptyProgress(stageIds)
  }
}

export function recordStageResult(
  result: StageResult,
  stageIds: readonly string[],
  storage: Storage = getDefaultStorage() as Storage,
): ProgressWriteResult {
  if (!storage) return { ok: false, reason: 'unavailable' }
  const stageIndex = stageIds.indexOf(result.stageId)
  if (stageIndex < 0) return { ok: false, reason: 'unavailable' }

  try {
    const current = loadRescueProgress(storage, stageIds)
    const nextStageId = stageIds[stageIndex + 1]
    const unlockedStageIds = nextStageId && !current.unlockedStageIds.includes(nextStageId)
      ? [...current.unlockedStageIds, nextStageId]
      : [...current.unlockedStageIds]
    const previousStampCount = current.bestStampCountByStage[result.stageId] ?? 0
    const previousMoves = current.bestMovesByStage[result.stageId]
    const progress: RescueProgress = {
      unlockedStageIds,
      bestStampCountByStage: {
        ...current.bestStampCountByStage,
        [result.stageId]: Math.max(previousStampCount, result.stampCount),
      },
      bestMovesByStage: {
        ...current.bestMovesByStage,
        [result.stageId]: previousMoves === undefined ? result.moves : Math.min(previousMoves, result.moves),
      },
      collectedTreasureIds: [...new Set([...current.collectedTreasureIds, ...result.collectedTreasureIds])],
    }
    storage.setItem(RESCUE_PROGRESS_KEY, JSON.stringify(progress))
    return { ok: true, progress }
  } catch {
    return { ok: false, reason: 'unavailable' }
  }
}
