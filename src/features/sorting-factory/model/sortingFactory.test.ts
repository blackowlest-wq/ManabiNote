import { describe, expect, it } from 'vitest'
import {
  applySortingFactoryAction,
  SORTING_LEVEL_TARGET,
  startSortingFactory,
  type SortingFactoryState,
} from './sortingFactory'

const alwaysFirst = () => 0

describe('sortingFactory', () => {
  it('starts a moving item on the first factory belt', () => {
    const state = startSortingFactory(alwaysFirst)

    expect(state.status).toBe('playing')
    expect(state.levelIndex).toBe(0)
    expect(state.currentItemId).toBe('apple')
    expect(state.itemPosition).toBe(0)
  })

  it('builds a combo when an item reaches its matching box', () => {
    const state = startSortingFactory(alwaysFirst)

    const sorted = applySortingFactoryAction(state, { type: 'sort', side: 'left' }, alwaysFirst)

    expect(sorted.state.totalSorted).toBe(1)
    expect(sorted.state.combo).toBe(1)
    expect(sorted.state.score).toBe(100)
    expect(sorted.events).toContainEqual({ type: 'item-sorted', itemId: 'apple', combo: 1 })
  })

  it('loses one heart and the combo when sent to the other box', () => {
    const state = { ...startSortingFactory(alwaysFirst), combo: 3 }

    const dropped = applySortingFactoryAction(state, { type: 'sort', side: 'right' }, alwaysFirst)

    expect(dropped.state.hearts).toBe(2)
    expect(dropped.state.combo).toBe(0)
    expect(dropped.events).toContainEqual({ type: 'item-dropped', itemId: 'apple' })
  })

  it('drops an item that reaches the end of the belt', () => {
    const state: SortingFactoryState = {
      ...startSortingFactory(alwaysFirst),
      itemPosition: 5,
    }

    const moved = applySortingFactoryAction(state, { type: 'tick' }, alwaysFirst)

    expect(moved.state.hearts).toBe(2)
    expect(moved.state.itemPosition).toBe(0)
    expect(moved.events.some((event) => event.type === 'item-missed')).toBe(true)
  })

  it('finishes a belt after sorting four items', () => {
    const state: SortingFactoryState = {
      ...startSortingFactory(alwaysFirst),
      sortedInLevel: SORTING_LEVEL_TARGET - 1,
      totalSorted: SORTING_LEVEL_TARGET - 1,
    }

    const cleared = applySortingFactoryAction(state, { type: 'sort', side: 'left' }, alwaysFirst)

    expect(cleared.state.status).toBe('level-won')
    expect(cleared.events).toContainEqual({ type: 'level-won', levelIndex: 0 })
  })
})
