import { describe, expect, it } from 'vitest'
import {
  applyFireflyAction,
  FIREFLY_STAGES,
  startFireflyLights,
} from './fireflyLights'

describe('fireflyLights', () => {
  it('toggles the tapped firefly and its orthogonal neighbors', () => {
    const state = startFireflyLights(2)

    const changed = applyFireflyAction(state, { type: 'tap-firefly', index: 4 })

    for (const index of [1, 3, 4, 5, 7]) {
      expect(changed.state.lights[index]).not.toBe(state.lights[index])
    }
    for (const index of [0, 2, 6, 8]) {
      expect(changed.state.lights[index]).toBe(state.lights[index])
    }
  })

  it('can reset a partly changed garden', () => {
    const start = startFireflyLights(0)
    const changed = applyFireflyAction(start, { type: 'tap-firefly', index: 1 }).state

    const reset = applyFireflyAction(changed, { type: 'reset-stage' })

    expect(reset.state.lights).toEqual(start.lights)
    expect(reset.state.moveCount).toBe(0)
  })

  it('keeps every handmade light pattern solvable through real taps', () => {
    for (const [stageIndex, stage] of FIREFLY_STAGES.entries()) {
      let state = startFireflyLights(stageIndex)
      for (const index of stage.solution) state = applyFireflyAction(state, { type: 'tap-firefly', index }).state
      expect(state.status, stage.name).toBe(stageIndex === FIREFLY_STAGES.length - 1 ? 'finished' : 'stage-won')
      expect(state.lights.every(Boolean)).toBe(true)
    }
  })
})
