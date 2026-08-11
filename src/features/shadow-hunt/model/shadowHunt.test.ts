import { describe, expect, it } from 'vitest'
import {
  applyShadowHuntAction,
  calculateShadowHuntResult,
  SHADOW_HUNT_CLEAR_TARGET,
  startShadowHunt,
  type ShadowHuntState,
} from './shadowHunt'

const alwaysFirst = () => 0

describe('shadowHunt', () => {
  it('captures a matching silhouette and starts a combo collection', () => {
    const state = startShadowHunt({ durationSeconds: 45 }, alwaysFirst)
    const targetSlot = state.fieldMonsterIds.indexOf(state.targetMonsterId)

    const captured = applyShadowHuntAction(state, { type: 'capture', slotIndex: targetSlot }, alwaysFirst)

    expect(captured.state.captureCount).toBe(1)
    expect(captured.state.combo).toBe(1)
    expect(captured.state.capturedMonsterIds).toContain(state.targetMonsterId)
    expect(captured.events).toContainEqual({ type: 'monster-captured', monsterId: state.targetMonsterId, combo: 1 })
    expect(captured.state.fieldMonsterIds).toHaveLength(5)
  })

  it('uses three flashlight chances before the shadow escapes', () => {
    const state = startShadowHunt({ durationSeconds: 45 }, alwaysFirst)
    const distractorSlot = state.fieldMonsterIds.findIndex((id) => id !== state.targetMonsterId)

    const first = applyShadowHuntAction(state, { type: 'capture', slotIndex: distractorSlot }, alwaysFirst)
    const second = applyShadowHuntAction(first.state, { type: 'capture', slotIndex: distractorSlot }, alwaysFirst)
    const third = applyShadowHuntAction(second.state, { type: 'capture', slotIndex: distractorSlot }, alwaysFirst)

    expect(first.state.flashlightEnergy).toBe(2)
    expect(second.state.flashlightEnergy).toBe(1)
    expect(third.state.flashlightEnergy).toBe(3)
    expect(third.state.missedCount).toBe(1)
    expect(third.events).toContainEqual({ type: 'shadow-escaped' })
  })

  it('finishes when time runs out', () => {
    const state = { ...startShadowHunt({ durationSeconds: 1 }, alwaysFirst), timeLeft: 1 }

    const finished = applyShadowHuntAction(state, { type: 'tick' }, alwaysFirst)

    expect(finished.state.status).toBe('finished')
    expect(finished.state.timeLeft).toBe(0)
    expect(finished.events).toContainEqual({ type: 'game-finished' })
  })

  it('clears after capturing six monsters', () => {
    const state: ShadowHuntState = {
      ...startShadowHunt({}, alwaysFirst),
      captureCount: SHADOW_HUNT_CLEAR_TARGET - 1,
      combo: 2,
    }
    const targetSlot = state.fieldMonsterIds.indexOf(state.targetMonsterId)

    const finished = applyShadowHuntAction(state, { type: 'capture', slotIndex: targetSlot }, alwaysFirst)

    expect(finished.state.status).toBe('finished')
    expect(calculateShadowHuntResult(finished.state).isCleared).toBe(true)
  })

  it('does not calculate a result while a hunt is active', () => {
    expect(() => calculateShadowHuntResult(startShadowHunt({}, alwaysFirst))).toThrow()
  })
})
