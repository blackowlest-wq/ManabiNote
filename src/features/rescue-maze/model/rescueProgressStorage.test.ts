import { describe, expect, it } from 'vitest'
import { loadRescueProgress, recordStageResult } from './rescueProgressStorage'

const makeStorage = (): Storage => {
  const values = new Map<string, string>()
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

describe('rescueProgressStorage', () => {
  it('unlocks only the first stage when no progress is saved', () => {
    expect(loadRescueProgress(makeStorage(), ['rescue-1', 'rescue-2'])).toEqual({
      unlockedStageIds: ['rescue-1'],
      bestStampCountByStage: {},
      bestMovesByStage: {},
      collectedTreasureIds: [],
    })
  })

  it('records a clear result and unlocks the next stage', () => {
    const storage = makeStorage()

    const saved = recordStageResult(
      {
        stageId: 'rescue-1',
        stampCount: 2,
        maxStampCount: 3,
        moves: 7,
        collectedTreasureIds: ['ruby-1'],
      },
      ['rescue-1', 'rescue-2'],
      storage,
    )

    expect(saved).toEqual({
      ok: true,
      progress: {
        unlockedStageIds: ['rescue-1', 'rescue-2'],
        bestStampCountByStage: { 'rescue-1': 2 },
        bestMovesByStage: { 'rescue-1': 7 },
        collectedTreasureIds: ['ruby-1'],
      },
    })
    expect(loadRescueProgress(storage, ['rescue-1', 'rescue-2'])).toEqual(saved.ok ? saved.progress : undefined)
  })

  it('ignores malformed saved progress instead of exposing broken stage state', () => {
    const storage = makeStorage()
    storage.setItem('manabinote.rescue-maze-progress.v1', JSON.stringify({
      unlockedStageIds: ['rescue-1', 2],
      bestStampCountByStage: { 'rescue-1': 'three' },
      bestMovesByStage: {},
      collectedTreasureIds: [],
    }))

    expect(loadRescueProgress(storage, ['rescue-1', 'rescue-2'])).toEqual({
      unlockedStageIds: ['rescue-1'],
      bestStampCountByStage: {},
      bestMovesByStage: {},
      collectedTreasureIds: [],
    })
  })
})
