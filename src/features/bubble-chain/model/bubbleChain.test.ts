import { describe, expect, it } from 'vitest'
import { applyBubbleChainAction, BUBBLE_CHAIN_STAGES, startBubbleChain } from './bubbleChain'

describe('bubbleChain', () => {
  it('offers twelve stages', () => {
    expect(BUBBLE_CHAIN_STAGES).toHaveLength(12)
  })

  it('spreads a burst to orthogonal bubbles and continues the chain', () => {
    const burst = applyBubbleChainAction(startBubbleChain(0), { type: 'tap-bubble', index: 0 })
    expect(burst.state.strengths).toEqual([0, 0, 0, 0])
    expect(burst.events.some((event) => event.type === 'chain' && event.count === 4)).toBe(true)
  })

  it('reduces a strong bubble without bursting it too early', () => {
    const tapped = applyBubbleChainAction(startBubbleChain(2), { type: 'tap-bubble', index: 1 })
    expect(tapped.state.strengths[1]).toBe(1)
    expect(tapped.state.status).toBe('playing')
  })

  it('undoes the last tap and its whole chain', () => {
    const state = startBubbleChain(2)
    const tapped = applyBubbleChainAction(state, { type: 'tap-bubble', index: 1 }).state
    expect(applyBubbleChainAction(tapped, { type: 'undo' }).state.strengths).toEqual(state.strengths)
  })

  it('keeps every chain stage solvable through real taps', () => {
    for (const [stageIndex, stage] of BUBBLE_CHAIN_STAGES.entries()) {
      let state = startBubbleChain(stageIndex)
      for (const index of stage.solution) state = applyBubbleChainAction(state, { type: 'tap-bubble', index }).state
      expect(state.status, stage.name).toBe(stageIndex === BUBBLE_CHAIN_STAGES.length - 1 ? 'finished' : 'stage-won')
    }
  })
})
