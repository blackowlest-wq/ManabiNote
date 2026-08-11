import { describe, expect, it } from 'vitest'
import { applyShapeCatcherAction, SHAPE_CATCHER_STAGES, startShapeCatcher } from './shapeCatcher'

describe('shapeCatcher', () => {
  it('offers twelve shape-catching stages', () => {
    expect(SHAPE_CATCHER_STAGES).toHaveLength(12)
  })

  it('rotates a catcher by a quarter turn', () => {
    const state = startShapeCatcher(0)
    expect(applyShapeCatcherAction(state, { type: 'rotate', kind: 'bar' }).state.rotations.bar).toBe(1)
  })

  it('moves the falling shape closer on each beat', () => {
    const state = startShapeCatcher(0)
    expect(applyShapeCatcherAction(state, { type: 'tick' }).state.fall).toBe(state.fall - 1)
  })

  it('loses a heart when the catcher has the wrong rotation', () => {
    const state = { ...startShapeCatcher(0), fall: 1, rotations: { bar: 1, corner: 0, tee: 0 } }
    expect(applyShapeCatcherAction(state, { type: 'tick' }).state.hearts).toBe(2)
  })

  it('keeps every stage clearable by rotating real catchers before each drop', () => {
    for (const [stageIndex, stage] of SHAPE_CATCHER_STAGES.entries()) {
      let state = startShapeCatcher(stageIndex)
      for (const piece of stage.pieces) {
        while (state.rotations[piece.kind] !== piece.rotation) state = applyShapeCatcherAction(state, { type: 'rotate', kind: piece.kind }).state
        for (let tick = 0; tick < stage.dropTicks; tick += 1) state = applyShapeCatcherAction(state, { type: 'tick' }).state
      }
      expect(state.status, stage.name).toBe(stageIndex === SHAPE_CATCHER_STAGES.length - 1 ? 'finished' : 'stage-won')
      expect(state.hearts, stage.name).toBe(3)
    }
  })
})
