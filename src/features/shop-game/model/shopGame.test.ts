import { describe, expect, it } from 'vitest'
import { applyShopAction, startShopGame } from './shopGame'

describe('shopGame', () => {
  it('serves an exact basket and welcomes the next customer with a combo', () => {
    let state = startShopGame({ durationSeconds: 60 })

    state = applyShopAction(state, { type: 'pick-product', productId: 'apple' }).state
    state = applyShopAction(state, { type: 'pick-product', productId: 'apple' }).state
    const delivered = applyShopAction(state, { type: 'deliver' })

    expect(delivered.state.servedCount).toBe(1)
    expect(delivered.state.combo).toBe(1)
    expect(delivered.state.basket).toEqual([])
    expect(delivered.state.coins).toBe(4)
    expect(delivered.state.orderIndex).toBe(1)
    expect(delivered.events).toContainEqual({ type: 'order-delivered', orderId: 'apple-pair', combo: 1 })
  })

  it('hides a memory order after the first item and lets the child revise the basket', () => {
    const state = {
      ...startShopGame(),
      orderIndex: 3,
      combo: 2,
      patience: 16,
      maxPatience: 16,
    }

    const picked = applyShopAction(state, { type: 'pick-product', productId: 'carrot' })
    const checked = applyShopAction(picked.state, { type: 'deliver' })
    const removed = applyShopAction(checked.state, { type: 'remove-product', basketIndex: 0 })

    expect(picked.state.orderHidden).toBe(true)
    expect(checked.state.combo).toBe(0)
    expect(checked.state.patience).toBe(14)
    expect(checked.events).toEqual([{ type: 'basket-mismatch' }])
    expect(removed.state.basket).toEqual([])
  })
})
