import { describe, expect, it } from 'vitest'
import {
  applyLogSlideAction,
  LOG_SLIDE_STAGES,
  startLogSlide,
} from './logSlide'

describe('logSlide', () => {
  it('moves a log only along its own direction', () => {
    const state = startLogSlide(0)

    const moved = applyLogSlideAction(state, { type: 'move-piece', id: 'a', delta: 1 })

    expect(moved.state.pieces.find((piece) => piece.id === 'a')?.row).toBe(1)
    expect(moved.events).toContainEqual({ type: 'piece-moved', id: 'a', delta: 1 })
  })

  it('does not move through another piece or outside the pond', () => {
    const state = startLogSlide(0)

    const blockedLog = applyLogSlideAction(state, { type: 'move-piece', id: 'a', delta: -1 })
    const blockedSled = applyLogSlideAction(state, { type: 'move-piece', id: 'squirrel', delta: 1 })

    expect(blockedLog.state).toBe(state)
    expect(blockedSled.state).toBe(state)
    expect(blockedSled.events).toContainEqual({ type: 'blocked', id: 'squirrel' })
  })

  it('undoes the last slide with its move count', () => {
    const state = startLogSlide(0)
    const moved = applyLogSlideAction(state, { type: 'move-piece', id: 'a', delta: 1 }).state

    const undone = applyLogSlideAction(moved, { type: 'undo' })

    expect(undone.state.pieces).toEqual(state.pieces)
    expect(undone.state.moveCount).toBe(0)
  })

  it('keeps every handmade sliding stage solvable through real moves', () => {
    for (const [stageIndex, stage] of LOG_SLIDE_STAGES.entries()) {
      let state = startLogSlide(stageIndex)
      for (const move of stage.solution) {
        state = applyLogSlideAction(state, { type: 'move-piece', ...move }).state
      }
      expect(state.status, stage.name).toBe(stageIndex === LOG_SLIDE_STAGES.length - 1 ? 'finished' : 'stage-won')
      expect(state.moveCount, stage.name).toBe(stage.optimalMoves)
    }
  })
})
