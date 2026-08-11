import { describe, expect, it } from 'vitest'
import { applyPenguinIceAction, PENGUIN_ICE_STAGES, startPenguinIce } from './penguinIce'

describe('penguinIce', () => {
  it('lets the penguin move only to an adjacent unclaimed ice floe', () => {
    const state = startPenguinIce(0)
    expect(applyPenguinIceAction(state, { type: 'move', index: 8 }).state.playerIndex).toBe(8)
    expect(applyPenguinIceAction(state, { type: 'move', index: 0 }).state).toBe(state)
  })

  it('moves the seal to its neighboring floe with the most fish', () => {
    const moved = applyPenguinIceAction(startPenguinIce(0), { type: 'move', index: 8 })
    expect(moved.state.rivalIndex).toBe(2)
    expect(moved.state.rivalScore).toBe(2)
    expect(moved.events.some(event => event.type === 'rival-moved')).toBe(true)
  })

  it('removes claimed ice so neither animal can collect it twice', () => {
    let state = startPenguinIce(0)
    state = applyPenguinIceAction(state, { type: 'move', index: 8 }).state
    state = applyPenguinIceAction(state, { type: 'move', index: 4 }).state
    const revisit = applyPenguinIceAction(state, { type: 'move', index: 8 })
    expect(revisit.state).toBe(state)
  })

  it('keeps every island winnable through real moves against the seal', () => {
    for (const [stageIndex, stage] of PENGUIN_ICE_STAGES.entries()) {
      let state = startPenguinIce(stageIndex)
      for (const index of stage.solution) state = applyPenguinIceAction(state, { type: 'move', index }).state
      expect(state.status, stage.name).toBe(stageIndex === PENGUIN_ICE_STAGES.length - 1 ? 'finished' : 'stage-won')
      expect(state.playerScore, stage.name).toBeGreaterThan(state.rivalScore)
    }
  })
})
