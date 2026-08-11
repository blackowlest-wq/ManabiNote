import { describe, expect, it } from 'vitest'
import { applyTreasureAction, startTreasureHunt } from './treasureHunt'

const alwaysFirst = () => 0

describe('treasureHunt', () => {
  it('leaves a direction and distance clue before the treasure is found', () => {
    let state = startTreasureHunt(alwaysFirst)

    const clue = applyTreasureAction(state, { type: 'dig', index: 15 }, alwaysFirst)
    state = clue.state

    expect(state.dugCells).toEqual([{ index: 15, distance: 6, direction: 'up-left', warmth: 'cold' }])
    expect(state.digsLeft).toBe(5)
    expect(clue.events).toEqual([{ type: 'clue-found', direction: 'up-left', warmth: 'cold' }])

    const found = applyTreasureAction(state, { type: 'dig', index: 0 }, alwaysFirst)
    expect(found.state.status).toBe('round-won')
    expect(found.state.foundCount).toBe(1)
    expect(found.events).toContainEqual({ type: 'treasure-found' })
  })
})
