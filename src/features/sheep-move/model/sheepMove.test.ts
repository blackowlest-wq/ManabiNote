import { describe, expect, it } from 'vitest'
import {
  applySheepMoveAction,
  SHEEP_STAGES,
  startSheepMove,
} from './sheepMove'

describe('sheepMove', () => {
  it('moves the shepherd one open cell', () => {
    const state = startSheepMove(0)

    const moved = applySheepMoveAction(state, { type: 'move', direction: 'right' })

    expect(moved.state.player).toEqual({ row: 2, column: 1 })
    expect(moved.events.some((event) => event.type === 'player-moved')).toBe(true)
  })

  it('pushes a sheep when the cell beyond it is open', () => {
    let state = startSheepMove(0)
    state = applySheepMoveAction(state, { type: 'move', direction: 'right' }).state

    const pushed = applySheepMoveAction(state, { type: 'move', direction: 'right' })

    expect(pushed.state.sheep).toContainEqual({ row: 2, column: 3 })
    expect(pushed.events.some((event) => event.type === 'sheep-pushed')).toBe(true)
  })

  it('does not push a sheep into the edge or a wall', () => {
    let state = startSheepMove(0)
    state = { ...state, player: { row: 2, column: 3 }, sheep: [{ row: 2, column: 4 }] }

    const blocked = applySheepMoveAction(state, { type: 'move', direction: 'right' })

    expect(blocked.state).toBe(state)
    expect(blocked.events).toContainEqual({ type: 'blocked' })
  })

  it('undoes the last valid move including a sheep push', () => {
    let state = startSheepMove(0)
    state = applySheepMoveAction(state, { type: 'move', direction: 'right' }).state
    state = applySheepMoveAction(state, { type: 'move', direction: 'right' }).state

    const undone = applySheepMoveAction(state, { type: 'undo' })

    expect(undone.state.player).toEqual({ row: 2, column: 1 })
    expect(undone.state.sheep).toContainEqual({ row: 2, column: 2 })
  })

  it('keeps every handmade moving stage solvable through real actions', () => {
    for (const [stageIndex, stage] of SHEEP_STAGES.entries()) {
      let state = startSheepMove(stageIndex)
      for (const direction of stage.solution) state = applySheepMoveAction(state, { type: 'move', direction }).state
      expect(state.status, stage.name).toBe(stageIndex === SHEEP_STAGES.length - 1 ? 'finished' : 'stage-won')
    }
  })
})
