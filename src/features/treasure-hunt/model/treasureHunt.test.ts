import { describe, expect, it } from 'vitest'
import { applyTreasureAction, startTreasureHunt, TREASURE_ROUNDS } from './treasureHunt'

const alwaysFirst = () => 0

describe('treasureHunt', () => {
  it('offers twelve treasure islands', () => {
    expect(TREASURE_ROUNDS).toHaveLength(12)
  })

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

  it('can find a treasure and travel through all twelve islands', () => {
    let state = startTreasureHunt(alwaysFirst)
    for (let roundIndex = 0; roundIndex < TREASURE_ROUNDS.length; roundIndex += 1) {
      state = applyTreasureAction(state, { type: 'dig', index: state.treasureIndex }, alwaysFirst).state
      state = applyTreasureAction(state, { type: 'next-round' }, alwaysFirst).state
    }

    expect(state.status).toBe('finished')
    expect(state.foundCount).toBe(12)
  })
})
