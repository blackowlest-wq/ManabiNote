import { describe, expect, it } from 'vitest'
import { clearRescueProgress, loadRescueProgress, recordStageResult } from './rescueProgressStorage'

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

  it('clears every saved stage result and returns to the first stage', () => {
    const storage = makeStorage()
    recordStageResult(
      {
        stageId: 'rescue-1',
        stampCount: 3,
        maxStampCount: 3,
        moves: 5,
        collectedTreasureIds: ['ruby-1'],
      },
      ['rescue-1', 'rescue-2'],
      storage,
    )

    expect(clearRescueProgress(storage)).toEqual({ ok: true })
    expect(loadRescueProgress(storage, ['rescue-1', 'rescue-2'])).toEqual({
      unlockedStageIds: ['rescue-1'],
      bestStampCountByStage: {},
      bestMovesByStage: {},
      collectedTreasureIds: [],
    })
  })

  it('unlocks the new next stage for a child who cleared the previous final stage', () => {
    const storage = makeStorage()
    storage.setItem('manabinote.rescue-maze-progress.v1', JSON.stringify({
      unlockedStageIds: ['rescue-1', 'rescue-2', 'rescue-3', 'rescue-4', 'rescue-5', 'rescue-6'],
      bestStampCountByStage: { 'rescue-6': 3 },
      bestMovesByStage: { 'rescue-6': 20 },
      collectedTreasureIds: [],
    }))

    const progress = loadRescueProgress(storage, [
      'rescue-1', 'rescue-2', 'rescue-3', 'rescue-4', 'rescue-5', 'rescue-6', 'rescue-7',
    ])

    expect(progress.unlockedStageIds).toContain('rescue-7')
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
