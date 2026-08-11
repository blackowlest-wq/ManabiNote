import { describe, expect, it } from 'vitest'
import { applyAnimalTowerAction, startAnimalTower } from './animalTower'

describe('animalTower', () => {
  it('moves the waiting floor sideways and bounces at the field edge', () => {
    const state = { ...startAnimalTower(), moving: { x: 5, width: 5 }, direction: 1 as const }
    const ticked = applyAnimalTowerAction(state, { type: 'tick' })
    expect(ticked.state.moving.x).toBe(4)
    expect(ticked.state.direction).toBe(-1)
  })

  it('keeps only the overlapping part when a floor is dropped', () => {
    const state = { ...startAnimalTower(), moving: { x: 5, width: 5 } }
    const dropped = applyAnimalTowerAction(state, { type: 'drop' })
    expect(dropped.state.base).toEqual({ x: 5, width: 3 })
    expect(dropped.state.floor).toBe(1)
    expect(dropped.events).toContainEqual({ type: 'floor-landed', overlap: 3 })
  })

  it('uses a heart when the floor misses the tower', () => {
    const state = { ...startAnimalTower(), moving: { x: 8, width: 2 } }
    const missed = applyAnimalTowerAction(state, { type: 'drop' })
    expect(missed.state.hearts).toBe(2)
    expect(missed.state.combo).toBe(0)
    expect(missed.events).toContainEqual({ type: 'floor-missed' })
  })

  it('finishes after stacking eight real floors', () => {
    let state = startAnimalTower()
    for (let floor = 0; floor < 8; floor += 1) {
      state = { ...state, moving: { ...state.base } }
      state = applyAnimalTowerAction(state, { type: 'drop' }).state
    }
    expect(state.status).toBe('finished')
    expect(state.floor).toBe(8)
  })
})
