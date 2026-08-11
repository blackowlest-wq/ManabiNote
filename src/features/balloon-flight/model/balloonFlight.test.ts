import { describe, expect, it } from 'vitest'
import {
  applyBalloonAction,
  BALLOON_CLEAR_TARGET,
  startBalloonFlight,
  type BalloonFlightState,
} from './balloonFlight'

const alwaysFirst = () => 0

describe('balloonFlight', () => {
  it('moves the balloon between three sky lanes without leaving them', () => {
    let state = startBalloonFlight(alwaysFirst)

    state = applyBalloonAction(state, { type: 'move-up' }, alwaysFirst).state
    state = applyBalloonAction(state, { type: 'move-up' }, alwaysFirst).state

    expect(state.playerRow).toBe(0)
    expect(applyBalloonAction(state, { type: 'move-up' }, alwaysFirst).state.playerRow).toBe(0)
  })

  it('moves the cloud gate closer on each tick', () => {
    const state = startBalloonFlight(alwaysFirst)

    const moved = applyBalloonAction(state, { type: 'tick' }, alwaysFirst)

    expect(moved.state.gateColumn).toBe(4)
  })

  it('builds a combo when the balloon passes through the gap', () => {
    const state: BalloonFlightState = {
      ...startBalloonFlight(alwaysFirst),
      playerRow: 0,
      gapRow: 0,
      gateColumn: 2,
    }

    const passed = applyBalloonAction(state, { type: 'tick' }, alwaysFirst)

    expect(passed.state.passedCount).toBe(1)
    expect(passed.state.combo).toBe(1)
    expect(passed.events).toContainEqual({ type: 'gate-passed', combo: 1 })
  })

  it('loses one heart after touching the cloud bank', () => {
    const state: BalloonFlightState = {
      ...startBalloonFlight(alwaysFirst),
      playerRow: 1,
      gapRow: 0,
      gateColumn: 2,
    }

    const hit = applyBalloonAction(state, { type: 'tick' }, alwaysFirst)

    expect(hit.state.hearts).toBe(2)
    expect(hit.state.combo).toBe(0)
    expect(hit.events).toContainEqual({ type: 'cloud-hit' })
  })

  it('finishes after flying through ten gates', () => {
    const state: BalloonFlightState = {
      ...startBalloonFlight(alwaysFirst),
      playerRow: 0,
      gapRow: 0,
      gateColumn: 2,
      passedCount: BALLOON_CLEAR_TARGET - 1,
    }

    const finished = applyBalloonAction(state, { type: 'tick' }, alwaysFirst)

    expect(finished.state.status).toBe('finished')
    expect(finished.events.some((event) => event.type === 'game-finished')).toBe(true)
  })
})
