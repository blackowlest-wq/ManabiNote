import { describe, expect, it } from 'vitest'
import { applyDanceSpotlightAction, DANCE_SPOTLIGHT_STAGES, startDanceSpotlight } from './danceSpotlight'

describe('danceSpotlight', () => {
  it('offers twelve repeating dance stages', () => {
    expect(DANCE_SPOTLIGHT_STAGES).toHaveLength(12)
  })

  it('moves the dancer between the three floor spots', () => {
    const state = startDanceSpotlight(0)
    expect(applyDanceSpotlightAction(state, { type: 'move', lane: 0 }).state.dancerLane).toBe(0)
    expect(applyDanceSpotlightAction(state, { type: 'move', lane: 3 }).state).toBe(state)
  })

  it('builds a combo while the dancer stays in each spotlight', () => {
    let state = startDanceSpotlight(0)
    state = applyDanceSpotlightAction(state, { type: 'move', lane: DANCE_SPOTLIGHT_STAGES[0].pattern[0] }).state
    const next = applyDanceSpotlightAction(state, { type: 'tick' })
    expect(next.state.combo).toBe(1)
    expect(next.events.some(event => event.type === 'spotlight-hit')).toBe(true)
  })

  it('loses a heart outside the spotlight', () => {
    const state = { ...startDanceSpotlight(0), dancerLane: 2 }
    const next = applyDanceSpotlightAction(state, { type: 'tick' })
    expect(next.state.hearts).toBe(state.hearts - 1)
    expect(next.state.combo).toBe(0)
  })

  it('keeps every dance stage clearable by following its repeating light', () => {
    for (const [stageIndex, stage] of DANCE_SPOTLIGHT_STAGES.entries()) {
      let state = startDanceSpotlight(stageIndex)
      for (let beat = 0; beat < stage.beats; beat += 1) {
        state = applyDanceSpotlightAction(state, { type: 'move', lane: stage.pattern[beat % stage.pattern.length] }).state
        state = applyDanceSpotlightAction(state, { type: 'tick' }).state
      }
      expect(state.status, stage.name).toBe(stageIndex === DANCE_SPOTLIGHT_STAGES.length - 1 ? 'finished' : 'stage-won')
      expect(state.hearts, stage.name).toBe(3)
    }
  })
})
