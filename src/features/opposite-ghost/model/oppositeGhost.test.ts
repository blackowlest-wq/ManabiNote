import { describe, expect, it } from 'vitest'
import {
  applyOppositeGhostAction,
  expectedDirection,
  OPPOSITE_LEVELS,
  OPPOSITE_LEVEL_TARGET,
  startOppositeGhost,
  type OppositeGhostState,
} from './oppositeGhost'

const alwaysFirst = () => 0

describe('oppositeGhost', () => {
  it('offers twelve gate courses', () => {
    expect(OPPOSITE_LEVELS).toHaveLength(12)
  })

  it('follows rabbits but reverses ghost arrows', () => {
    expect(expectedDirection({ actor: 'rabbit', arrow: 'left' })).toBe('left')
    expect(expectedDirection({ actor: 'rabbit', arrow: 'right' })).toBe('right')
    expect(expectedDirection({ actor: 'ghost', arrow: 'left' })).toBe('right')
    expect(expectedDirection({ actor: 'ghost', arrow: 'right' })).toBe('left')
  })

  it('starts with a follow-the-arrow rabbit card', () => {
    const state = startOppositeGhost(alwaysFirst)

    expect(state.currentCard).toEqual({ actor: 'rabbit', arrow: 'left' })
    expect(state.timeLeft).toBe(5)
  })

  it('builds a combo for moving in the required direction', () => {
    const state = startOppositeGhost(alwaysFirst)

    const moved = applyOppositeGhostAction(state, { type: 'move', direction: 'left' }, alwaysFirst)

    expect(moved.state.clearedInLevel).toBe(1)
    expect(moved.state.combo).toBe(1)
    expect(moved.events).toContainEqual({ type: 'gate-passed', combo: 1 })
  })

  it('requires the opposite direction when a ghost appears', () => {
    const state: OppositeGhostState = {
      ...startOppositeGhost(alwaysFirst),
      levelIndex: 1,
      currentCard: { actor: 'ghost', arrow: 'left' },
    }

    const moved = applyOppositeGhostAction(state, { type: 'move', direction: 'right' }, alwaysFirst)

    expect(moved.state.clearedInLevel).toBe(1)
    expect(moved.state.hearts).toBe(3)
  })

  it('finishes a stage after passing four gates', () => {
    const state: OppositeGhostState = {
      ...startOppositeGhost(alwaysFirst),
      clearedInLevel: OPPOSITE_LEVEL_TARGET - 1,
    }

    const cleared = applyOppositeGhostAction(state, { type: 'move', direction: 'left' }, alwaysFirst)

    expect(cleared.state.status).toBe('level-won')
    expect(cleared.events).toContainEqual({ type: 'level-won', levelIndex: 0 })
  })

  it('can pass the required gates through all twelve courses', () => {
    let state = startOppositeGhost(alwaysFirst)
    for (let levelIndex = 0; levelIndex < OPPOSITE_LEVELS.length; levelIndex += 1) {
      while (state.status === 'playing') {
        state = applyOppositeGhostAction(
          state,
          { type: 'move', direction: expectedDirection(state.currentCard) },
          alwaysFirst,
        ).state
      }
      if (levelIndex < OPPOSITE_LEVELS.length - 1) {
        state = applyOppositeGhostAction(state, { type: 'next-level' }, alwaysFirst).state
      }
    }

    expect(state.status).toBe('finished')
  })
})
