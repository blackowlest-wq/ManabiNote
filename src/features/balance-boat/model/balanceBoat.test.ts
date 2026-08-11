import { describe, expect, it } from 'vitest'
import {
  applyBalanceBoatAction,
  BALANCE_LEVELS,
  startBalanceBoat,
  type BalanceBoatState,
} from './balanceBoat'

const alwaysFirst = () => 0

describe('balanceBoat', () => {
  it('offers twelve harbors', () => {
    expect(BALANCE_LEVELS).toHaveLength(12)
  })

  it('starts with a one-weight parcel on an empty boat', () => {
    const state = startBalanceBoat(alwaysFirst)

    expect(state.currentWeight).toBe(1)
    expect(state.leftWeight).toBe(0)
    expect(state.rightWeight).toBe(0)
  })

  it('keeps a safely placed parcel on the selected side', () => {
    const state = startBalanceBoat(alwaysFirst)

    const placed = applyBalanceBoatAction(state, { type: 'place', side: 'left' }, alwaysFirst)

    expect(placed.state.leftWeight).toBe(1)
    expect(placed.state.deliveredInLevel).toBe(1)
    expect(placed.events).toContainEqual({ type: 'parcel-placed', side: 'left', weight: 1 })
  })

  it('rewards an exactly balanced boat and clears its deck', () => {
    const state: BalanceBoatState = {
      ...startBalanceBoat(alwaysFirst),
      leftWeight: 1,
      rightWeight: 0,
      currentWeight: 1,
      deliveredInLevel: 1,
      totalDelivered: 1,
    }

    const balanced = applyBalanceBoatAction(state, { type: 'place', side: 'right' }, alwaysFirst)

    expect(balanced.state.leftWeight).toBe(0)
    expect(balanced.state.rightWeight).toBe(0)
    expect(balanced.state.combo).toBe(1)
    expect(balanced.events.some((event) => event.type === 'boat-balanced')).toBe(true)
  })

  it('drops the deck cargo when the tilt exceeds the stage limit', () => {
    const state: BalanceBoatState = {
      ...startBalanceBoat(alwaysFirst),
      leftWeight: 3,
      currentWeight: 2,
    }

    const tipped = applyBalanceBoatAction(state, { type: 'place', side: 'left' }, alwaysFirst)

    expect(tipped.state.hearts).toBe(2)
    expect(tipped.state.leftWeight).toBe(0)
    expect(tipped.state.combo).toBe(0)
    expect(tipped.events).toContainEqual({ type: 'boat-tipped' })
  })

  it('finishes the first harbor after all its cargo is safely loaded', () => {
    const state: BalanceBoatState = {
      ...startBalanceBoat(alwaysFirst),
      deliveredInLevel: BALANCE_LEVELS[0].target - 1,
      totalDelivered: BALANCE_LEVELS[0].target - 1,
    }

    const cleared = applyBalanceBoatAction(state, { type: 'place', side: 'left' }, alwaysFirst)

    expect(cleared.state.status).toBe('level-won')
    expect(cleared.events).toContainEqual({ type: 'level-won', levelIndex: 0 })
  })

  it('can deliver safely through all twelve harbors', () => {
    let state = startBalanceBoat(alwaysFirst)
    for (let levelIndex = 0; levelIndex < BALANCE_LEVELS.length; levelIndex += 1) {
      while (state.status === 'playing') {
        const side = state.leftWeight <= state.rightWeight ? 'left' : 'right'
        state = applyBalanceBoatAction(state, { type: 'place', side }, alwaysFirst).state
      }
      if (levelIndex < BALANCE_LEVELS.length - 1) {
        state = applyBalanceBoatAction(state, { type: 'next-level' }, alwaysFirst).state
      }
    }

    expect(state.status).toBe('finished')
  })
})
