import { describe, expect, it } from 'vitest'
import {
  applyGhostHideAction,
  GHOST_HIDE_STAGES,
  startGhostHide,
} from './ghostHide'

describe('ghostHide', () => {
  it('shows the target before hiding it in a crowd', () => {
    const state = startGhostHide(0)

    const hidden = applyGhostHideAction(state, { type: 'hide-target' })

    expect(state.status).toBe('memorizing')
    expect(hidden.state.status).toBe('hunting')
    expect(hidden.state.crowd).toHaveLength(GHOST_HIDE_STAGES[0].crowdSize)
  })

  it('rewards finding the same combination of color, face, and hat', () => {
    let state = startGhostHide(0)
    state = applyGhostHideAction(state, { type: 'hide-target' }).state
    const targetIndex = state.crowd.findIndex((ghost) => ghost.id === state.target.id)

    const found = applyGhostHideAction(state, { type: 'choose-ghost', index: targetIndex })

    expect(found.state.status).toBe('round-won')
    expect(found.state.combo).toBe(1)
    expect(found.events.some((event) => event.type === 'target-found')).toBe(true)
  })

  it('uses a heart when a similar-looking decoy is tapped', () => {
    let state = startGhostHide(0)
    state = applyGhostHideAction(state, { type: 'hide-target' }).state
    const decoyIndex = state.crowd.findIndex((ghost) => ghost.id !== state.target.id)

    const missed = applyGhostHideAction(state, { type: 'choose-ghost', index: decoyIndex })

    expect(missed.state.hearts).toBe(2)
    expect(missed.state.combo).toBe(0)
    expect(missed.events).toContainEqual({ type: 'decoy-chosen' })
  })

  it('allows another short look at the cost of time', () => {
    let state = startGhostHide(0)
    state = applyGhostHideAction(state, { type: 'hide-target' }).state

    const peeked = applyGhostHideAction(state, { type: 'peek' })

    expect(peeked.state.status).toBe('memorizing')
    expect(peeked.state.timeLeft).toBe(state.timeLeft - 3)
  })

  it('finishes after finding the target in every hideout', () => {
    let state = startGhostHide()
    for (let round = 0; round < GHOST_HIDE_STAGES.length; round += 1) {
      state = applyGhostHideAction(state, { type: 'hide-target' }).state
      const targetIndex = state.crowd.findIndex((ghost) => ghost.id === state.target.id)
      state = applyGhostHideAction(state, { type: 'choose-ghost', index: targetIndex }).state
      if (round < GHOST_HIDE_STAGES.length - 1) state = applyGhostHideAction(state, { type: 'next-round' }).state
    }

    expect(state.status).toBe('finished')
  })
})
