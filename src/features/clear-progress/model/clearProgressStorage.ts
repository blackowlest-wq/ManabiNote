import { isGameId, type GameId } from './gameIds'

const CLEAR_PROGRESS_KEY = 'manabinote.clear-progress.v1'
const LEGACY_HISTORY_KEY = 'manabinote.history.v1'

export type GameClearRecord = {
  gameId: GameId
  clearedAt: string
}

export type StorageWriteResult = { ok: true } | { ok: false; reason: 'unavailable' | 'quota' }

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value)

const isGameClearRecord = (value: unknown): value is GameClearRecord =>
  isRecord(value) &&
  isGameId(value.gameId) &&
  typeof value.clearedAt === 'string' &&
  !Number.isNaN(new Date(value.clearedAt).getTime())

const getDefaultStorage = (): Storage | undefined => {
  try {
    return typeof window === 'undefined' ? undefined : window.localStorage
  } catch {
    return undefined
  }
}

const parseProgress = (saved: string | null): GameClearRecord[] => {
  if (saved === null) return []

  try {
    const parsed: unknown = JSON.parse(saved)
    if (!Array.isArray(parsed) || !parsed.every(isGameClearRecord)) return []
    if (new Set(parsed.map((record) => record.gameId)).size !== parsed.length) return []
    return parsed
  } catch {
    return []
  }
}

const isQuotaError = (error: unknown): boolean =>
  isRecord(error) && (error.name === 'QuotaExceededError' || error.code === 22 || error.code === 1014)

const discardLegacyHistory = (storage: Storage) => {
  try {
    storage.removeItem(LEGACY_HISTORY_KEY)
  } catch {
    // 旧履歴の削除失敗は、クリア状況の読み書きを妨げない。
  }
}

export const loadClearProgress = (
  storage: Storage = getDefaultStorage() as Storage,
): GameClearRecord[] => {
  if (!storage) return []

  try {
    const progress = parseProgress(storage.getItem(CLEAR_PROGRESS_KEY))
    discardLegacyHistory(storage)
    return progress
  } catch {
    return []
  }
}

export const markGameCleared = (
  gameId: GameId,
  storage: Storage = getDefaultStorage() as Storage,
  now: () => Date = () => new Date(),
): StorageWriteResult => {
  if (!storage || !isGameId(gameId)) return { ok: false, reason: 'unavailable' }

  try {
    const progress = parseProgress(storage.getItem(CLEAR_PROGRESS_KEY))
    discardLegacyHistory(storage)
    if (progress.some((record) => record.gameId === gameId)) return { ok: true }

    const clearedAt = now()
    if (Number.isNaN(clearedAt.getTime())) return { ok: false, reason: 'unavailable' }

    storage.setItem(CLEAR_PROGRESS_KEY, JSON.stringify([...progress, { gameId, clearedAt: clearedAt.toISOString() }]))
    return { ok: true }
  } catch (error) {
    return isQuotaError(error) ? { ok: false, reason: 'quota' } : { ok: false, reason: 'unavailable' }
  }
}

export const clearClearProgress = (
  storage: Storage = getDefaultStorage() as Storage,
): StorageWriteResult => {
  if (!storage) return { ok: false, reason: 'unavailable' }

  try {
    storage.removeItem(CLEAR_PROGRESS_KEY)
    storage.removeItem(LEGACY_HISTORY_KEY)
    return { ok: true }
  } catch {
    return { ok: false, reason: 'unavailable' }
  }
}
