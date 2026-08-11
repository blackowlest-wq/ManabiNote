import { describe, expect, it } from 'vitest'
import {
  applyFrogJumpAction,
  FROG_JUMP_STAGES,
  startFrogJump,
} from './frogJump'

describe('frogJump', () => {
  it('starts with frogs facing an empty stone between them', () => {
    const state = startFrogJump(0)

    expect(state.board).toEqual(['right', null, 'left'])
    expect(state.status).toBe('playing')
  })

  it('moves a frog only forward into the empty stone', () => {
    const state = startFrogJump(0)

    const moved = applyFrogJumpAction(state, { type: 'tap-frog', index: 0 })
    const backward = applyFrogJumpAction(moved.state, { type: 'tap-frog', index: 1 })

    expect(moved.state.board).toEqual([null, 'right', 'left'])
    expect(moved.events).toContainEqual({ type: 'frog-moved', from: 0, to: 1, jumped: false })
    expect(backward.state).toBe(moved.state)
    expect(backward.events).toContainEqual({ type: 'blocked' })
  })

  it('jumps over one frog when the landing stone is empty', () => {
    let state = startFrogJump(0)
    state = applyFrogJumpAction(state, { type: 'tap-frog', index: 0 }).state

    const jumped = applyFrogJumpAction(state, { type: 'tap-frog', index: 2 })

    expect(jumped.state.board).toEqual(['left', 'right', null])
    expect(jumped.events).toContainEqual({ type: 'frog-moved', from: 2, to: 0, jumped: true })
  })

  it('undoes the previous move so children can try another order', () => {
    const state = startFrogJump(0)
    const moved = applyFrogJumpAction(state, { type: 'tap-frog', index: 0 }).state

    const undone = applyFrogJumpAction(moved, { type: 'undo' })

    expect(undone.state.board).toEqual(state.board)
    expect(undone.state.moveCount).toBe(0)
  })

  it('keeps every stage solvable through real frog taps', () => {
    for (const [stageIndex, stage] of FROG_JUMP_STAGES.entries()) {
      let state = startFrogJump(stageIndex)
      for (const index of stage.solution) {
        state = applyFrogJumpAction(state, { type: 'tap-frog', index }).state
      }
      expect(state.status, stage.name).toBe(stageIndex === FROG_JUMP_STAGES.length - 1 ? 'finished' : 'stage-won')
      expect(state.moveCount, stage.name).toBe(stage.optimalMoves)
    }
  })
})
