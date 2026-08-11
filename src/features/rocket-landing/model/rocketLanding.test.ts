import { describe, expect, it } from 'vitest'
import { applyRocketLandingAction, ROCKET_LANDING_STAGES, startRocketLanding, type RocketLandingState } from './rocketLanding'

function findLanding(start: RocketLandingState) {
  const queue: RocketLandingState[] = [start]
  const seen = new Set<string>()
  while (queue.length > 0) {
    const state = queue.shift()!
    const key = [state.altitude, state.velocity, state.fuel, state.ticks, state.status].join(':')
    if (seen.has(key)) continue
    seen.add(key)
    if (state.status === 'stage-won' || state.status === 'finished') return true
    if (state.status !== 'playing') continue
    queue.push(applyRocketLandingAction(state, { type: 'tick' }).state)
    queue.push(applyRocketLandingAction(state, { type: 'thrust' }).state)
  }
  return false
}

describe('rocketLanding', () => {
  it('accelerates downward as time passes', () => {
    const state = startRocketLanding(0)
    const next = applyRocketLandingAction(state, { type: 'tick' }).state
    expect(next.velocity).toBe(1)
    expect(next.altitude).toBeLessThan(state.altitude)
  })

  it('uses fuel to slow the fall', () => {
    const falling = { ...startRocketLanding(0), velocity: 3 }
    const next = applyRocketLandingAction(falling, { type: 'thrust' }).state
    expect(next.velocity).toBe(1)
    expect(next.fuel).toBe(falling.fuel - 1)
  })

  it('crashes when it reaches the ground too fast', () => {
    const stage = ROCKET_LANDING_STAGES[0]
    const falling = { ...startRocketLanding(0), altitude: 1, velocity: stage.safeSpeed + 1 }
    expect(applyRocketLandingAction(falling, { type: 'tick' }).state.status).toBe('crashed')
  })

  it('keeps every planet landable through real thrust and time actions', () => {
    for (const [stageIndex, stage] of ROCKET_LANDING_STAGES.entries()) {
      expect(findLanding(startRocketLanding(stageIndex)), stage.name).toBe(true)
    }
  })
})
