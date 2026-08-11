import { afterEach, describe, expect, it, vi } from 'vitest'
import { clearClearProgress, loadClearProgress, markGameCleared } from './clearProgressStorage'

const KEY = 'manabinote.clear-progress.v1'
const LEGACY_KEY = 'manabinote.history.v1'

const makeStorage = (initial: Record<string, string> = {}): Storage => {
  const values = new Map(Object.entries(initial))
  return {
    get length() {
      return values.size
    },
    clear: () => values.clear(),
    getItem: (key) => values.get(key) ?? null,
    key: (index) => Array.from(values.keys())[index] ?? null,
    removeItem: (key) => void values.delete(key),
    setItem: (key, value) => void values.set(key, value),
  }
}

describe('clearProgressStorage', () => {
  afterEach(() => vi.restoreAllMocks())

  it('stores one clear record for each game and keeps the first clear time', () => {
    const storage = makeStorage()
    const firstClear = () => new Date('2026-08-11T01:00:00.000Z')
    const secondClear = () => new Date('2026-08-11T02:00:00.000Z')

    expect(markGameCleared('quiz', storage, firstClear)).toEqual({ ok: true })
    expect(markGameCleared('quiz', storage, secondClear)).toEqual({ ok: true })
    expect(markGameCleared('clock', storage, secondClear)).toEqual({ ok: true })

    expect(loadClearProgress(storage)).toEqual([
      { gameId: 'quiz', clearedAt: '2026-08-11T01:00:00.000Z' },
      { gameId: 'clock', clearedAt: '2026-08-11T02:00:00.000Z' },
    ])
  })

  it.each([
    ['malformed JSON', '{broken'],
    ['non-array data', JSON.stringify({ gameId: 'quiz' })],
    ['unknown game', JSON.stringify([{ gameId: 'unknown', clearedAt: '2026-08-11T01:00:00.000Z' }])],
    ['invalid date', JSON.stringify([{ gameId: 'quiz', clearedAt: 'not-a-date' }])],
    ['duplicate game', JSON.stringify([
      { gameId: 'quiz', clearedAt: '2026-08-11T01:00:00.000Z' },
      { gameId: 'quiz', clearedAt: '2026-08-11T02:00:00.000Z' },
    ])],
  ])('returns an empty list for %s', (_, saved) => {
    expect(loadClearProgress(makeStorage({ [KEY]: saved }))).toEqual([])
  })

  it('discards the old per-question history when progress is loaded', () => {
    const storage = makeStorage({ [LEGACY_KEY]: '[{"old":"history"}]' })

    expect(loadClearProgress(storage)).toEqual([])
    expect(storage.getItem(LEGACY_KEY)).toBeNull()
  })

  it('returns quota when progress cannot be saved', () => {
    const storage = makeStorage()
    storage.setItem = () => {
      throw new DOMException('full', 'QuotaExceededError')
    }

    expect(markGameCleared('quiz', storage)).toEqual({ ok: false, reason: 'quota' })
  })

  it('clears progress and legacy history without removing unrelated data', () => {
    const storage = makeStorage({
      [KEY]: JSON.stringify([{ gameId: 'quiz', clearedAt: '2026-08-11T01:00:00.000Z' }]),
      [LEGACY_KEY]: '[{"old":"history"}]',
      'other.key': 'keep me',
    })

    expect(clearClearProgress(storage)).toEqual({ ok: true })
    expect(loadClearProgress(storage)).toEqual([])
    expect(storage.getItem(LEGACY_KEY)).toBeNull()
    expect(storage.getItem('other.key')).toBe('keep me')
  })

  it('returns unavailable when default storage cannot be accessed', () => {
    vi.spyOn(window, 'localStorage', 'get').mockImplementation(() => {
      throw new Error('blocked')
    })

    expect(clearClearProgress()).toEqual({ ok: false, reason: 'unavailable' })
  })
})
