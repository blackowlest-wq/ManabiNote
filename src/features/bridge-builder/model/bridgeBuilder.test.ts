import { describe, expect, it } from 'vitest'
import {
  applyBridgeAction,
  BRIDGE_STAGES,
  startBridgeBuilder,
} from './bridgeBuilder'

describe('bridgeBuilder', () => {
  it('adds a selected log to the river span', () => {
    const state = startBridgeBuilder(0)

    const placed = applyBridgeAction(state, { type: 'place-log', logId: 's1-a' })

    expect(placed.state.placedLogIds).toEqual(['s1-a'])
    expect(placed.state.builtLength).toBe(1)
    expect(placed.events).toContainEqual({ type: 'log-placed', logId: 's1-a' })
  })

  it('lets the player pull the last log back', () => {
    const state = applyBridgeAction(startBridgeBuilder(0), { type: 'place-log', logId: 's1-a' }).state

    const removed = applyBridgeAction(state, { type: 'remove-last' })

    expect(removed.state.placedLogIds).toEqual([])
    expect(removed.state.builtLength).toBe(0)
  })

  it('collapses and returns all logs after overshooting the bank', () => {
    let state = startBridgeBuilder(1)
    state = applyBridgeAction(state, { type: 'place-log', logId: 's2-a' }).state
    state = applyBridgeAction(state, { type: 'place-log', logId: 's2-b' }).state

    const collapsed = applyBridgeAction(state, { type: 'place-log', logId: 's2-c' })

    expect(collapsed.state.placedLogIds).toEqual([])
    expect(collapsed.state.collapseCount).toBe(1)
    expect(collapsed.events).toContainEqual({ type: 'bridge-collapsed' })
  })

  it('clears a stage when the logs exactly reach the other bank', () => {
    let state = startBridgeBuilder(0)

    for (const logId of BRIDGE_STAGES[0].solution) {
      state = applyBridgeAction(state, { type: 'place-log', logId }).state
    }

    expect(state.status).toBe('stage-won')
    expect(state.builtLength).toBe(BRIDGE_STAGES[0].span)
  })

  it('keeps every handmade stage solvable through real placement actions', () => {
    for (const [stageIndex, stage] of BRIDGE_STAGES.entries()) {
      let state = startBridgeBuilder(stageIndex)
      for (const logId of stage.solution) state = applyBridgeAction(state, { type: 'place-log', logId }).state
      expect(state.status, stage.name).toBe(stageIndex === BRIDGE_STAGES.length - 1 ? 'finished' : 'stage-won')
    }
  })
})
