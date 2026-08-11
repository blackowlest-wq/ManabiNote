import { describe, expect, it } from 'vitest'
import {
  applyBeeRouteAction,
  BEE_ROUTE_STAGES,
  startBeeRoute,
} from './beeRoute'

describe('beeRoute', () => {
  it('spends energy based on the grid distance and collects nectar', () => {
    const state = startBeeRoute(0)

    const flown = applyBeeRouteAction(state, { type: 'fly-to', target: 'a' })

    expect(flown.state.energyLeft).toBe(state.energyLeft - 2)
    expect(flown.state.collected).toContain('a')
    expect(flown.events).toContainEqual({ type: 'flower-visited', id: 'a', cost: 2 })
  })

  it('waits to return to the hive until every flower has nectar collected', () => {
    const state = startBeeRoute(1)

    const earlyReturn = applyBeeRouteAction(state, { type: 'fly-to', target: 'hive' })

    expect(earlyReturn.state).toBe(state)
    expect(earlyReturn.events).toContainEqual({ type: 'flowers-remaining' })
  })

  it('gets tired when the next flight costs more than the remaining energy', () => {
    const state = { ...startBeeRoute(0), energyLeft: 1 }

    const tired = applyBeeRouteAction(state, { type: 'fly-to', target: 'a' })

    expect(tired.state.status).toBe('failed')
    expect(tired.events).toContainEqual({ type: 'out-of-energy' })
  })

  it('undoes a flight to support trying a different route', () => {
    const state = startBeeRoute(0)
    const flown = applyBeeRouteAction(state, { type: 'fly-to', target: 'a' }).state

    const undone = applyBeeRouteAction(flown, { type: 'undo' })

    expect(undone.state.position).toBe('hive')
    expect(undone.state.energyLeft).toBe(state.energyLeft)
    expect(undone.state.collected).toEqual([])
  })

  it('keeps every flower route solvable within its best-energy target', () => {
    for (const [stageIndex, stage] of BEE_ROUTE_STAGES.entries()) {
      let state = startBeeRoute(stageIndex)
      for (const target of stage.solution) state = applyBeeRouteAction(state, { type: 'fly-to', target }).state
      expect(state.status, stage.name).toBe(stageIndex === BEE_ROUTE_STAGES.length - 1 ? 'finished' : 'stage-won')
      expect(stage.energyBudget - state.energyLeft, stage.name).toBe(stage.optimalEnergy)
    }
  })
})
