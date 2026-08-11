import { describe, expect, it } from 'vitest'
import { applyCatChaseAction, CAT_CHASE_STAGES, startCatChase } from './catChase'

describe('catChase', () => {
  it('offers twelve forests to chase through', () => {
    expect(CAT_CHASE_STAGES).toHaveLength(12)
  })

  it('moves the cat only to an adjacent open cell', () => {
    const state = startCatChase(0)
    expect(applyCatChaseAction(state, { type: 'move', index: 8 }).state.catIndex).toBe(8)
    expect(applyCatChaseAction(state, { type: 'move', index: 0 }).state).toBe(state)
  })

  it('lets the mouse rest once and then flee farther away', () => {
    let state = startCatChase(0)
    state = applyCatChaseAction(state, { type: 'move', index: 8 }).state
    expect(state.mouseIndex).toBe(3)
    state = applyCatChaseAction(state, { type: 'move', index: 4 }).state
    expect(state.mouseIndex).toBe(7)
  })

  it('fails when the turn limit is used up without a catch', () => {
    const state = { ...startCatChase(0), turn: CAT_CHASE_STAGES[0].turnLimit - 1 }
    const failed = applyCatChaseAction(state, { type: 'move', index: 8 })
    expect(failed.state.status).toBe('failed')
  })

  it('keeps every chase stage solvable through real moves', () => {
    for (const [stageIndex, stage] of CAT_CHASE_STAGES.entries()) {
      let state = startCatChase(stageIndex)
      for (const index of stage.solution) state = applyCatChaseAction(state, { type: 'move', index }).state
      expect(state.status, stage.name).toBe(stageIndex === CAT_CHASE_STAGES.length - 1 ? 'finished' : 'stage-won')
    }
  })
})
