import { describe, expect, it } from 'vitest'
import {
  applyLabyrinthAction,
  LABYRINTH_STAGES,
  startRollingLabyrinth,
} from './rollingLabyrinth'

describe('rollingLabyrinth', () => {
  it('rotates clockwise and lets gravity roll the ball to the screen bottom', () => {
    const state = startRollingLabyrinth(0)

    const rolled = applyLabyrinthAction(state, { type: 'rotate-clockwise' })

    expect(rolled.state.orientation).toBe(1)
    expect(rolled.state.ball).toEqual({ row: 0, column: 4 })
    expect(rolled.events.some((event) => event.type === 'ball-rolled')).toBe(true)
  })

  it('collects every star crossed while rolling', () => {
    const state = startRollingLabyrinth(1)

    const first = applyLabyrinthAction(state, { type: 'rotate-clockwise' })
    const second = applyLabyrinthAction(first.state, { type: 'rotate-clockwise' })

    expect(second.state.collectedStarIds).toContain('s2-star')
  })

  it('does not leave the board or pass through a rock', () => {
    const state = startRollingLabyrinth(2)

    const rolled = applyLabyrinthAction(state, { type: 'rotate-clockwise' })

    expect(rolled.state.ball).toEqual({ row: 4, column: 2 })
  })

  it('keeps all six handmade labyrinths solvable through real rotations', () => {
    for (const [stageIndex, stage] of LABYRINTH_STAGES.entries()) {
      let state = startRollingLabyrinth(stageIndex)
      for (const direction of stage.solution) state = applyLabyrinthAction(state, { type: direction }).state
      expect(state.status, stage.name).toBe(stageIndex === LABYRINTH_STAGES.length - 1 ? 'finished' : 'stage-won')
      expect(state.collectedStarIds).toHaveLength(stage.stars.length)
    }
  })
})
