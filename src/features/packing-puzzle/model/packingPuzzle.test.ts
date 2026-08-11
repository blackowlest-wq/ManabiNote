import { describe, expect, it } from 'vitest'
import { applyPackingAction, calculatePackingStars, PACKING_STAGES, startPackingStage } from './packingPuzzle'

describe('packingPuzzle', () => {
  it('rotates and packs every box to clear the first truck bed', () => {
    const stage = PACKING_STAGES[0]
    let state = startPackingStage(stage)

    state = applyPackingAction(stage, state, { type: 'rotate-selected' }).state
    state = applyPackingAction(stage, state, { type: 'place-selected', anchorIndex: 0 }).state
    state = applyPackingAction(stage, state, { type: 'select-piece', pieceId: 'blue-domino' }).state
    state = applyPackingAction(stage, state, { type: 'rotate-selected' }).state
    const packed = applyPackingAction(stage, state, { type: 'place-selected', anchorIndex: 2 })

    expect(packed.state.status).toBe('cleared')
    expect(packed.state.placements).toHaveLength(2)
    expect(packed.events).toContainEqual({ type: 'truck-packed' })
    expect(calculatePackingStars(stage, packed.state)).toBe(3)
  })

  it('ships five stages whose pieces can cover every marked cargo cell', () => {
    expect(PACKING_STAGES).toHaveLength(5)
    for (const stage of PACKING_STAGES) {
      let state = startPackingStage(stage)
      for (const placement of stage.solution) {
        state = applyPackingAction(stage, state, { type: 'select-piece', pieceId: placement.pieceId }).state
        while ((state.rotations[placement.pieceId] ?? 0) !== placement.rotation) {
          state = applyPackingAction(stage, state, { type: 'rotate-selected' }).state
        }
        state = applyPackingAction(stage, state, { type: 'place-selected', anchorIndex: placement.anchorIndex }).state
      }
      expect(state.status, stage.id).toBe('cleared')
    }
  })
})
