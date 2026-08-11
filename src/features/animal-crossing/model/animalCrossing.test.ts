import { describe, expect, it } from 'vitest'
import { ANIMAL_CROSSING_STAGES, applyAnimalCrossingAction, startAnimalCrossing, type AnimalCrossingState, type Route } from './animalCrossing'

function chooseSignal(state: AnimalCrossingState, signal: Route) {
  return applyAnimalCrossingAction(applyAnimalCrossingAction(state, { type: 'set-signal', signal }).state, { type: 'tick' }).state
}

describe('animalCrossing', () => {
  it('offers twelve intersections to manage', () => {
    expect(ANIMAL_CROSSING_STAGES).toHaveLength(12)
  })

  it('keeps a car stopped while its signal is red', () => {
    let state = startAnimalCrossing(0)
    state = applyAnimalCrossingAction(state, { type: 'set-signal', signal: 'vertical' }).state
    state = applyAnimalCrossingAction(state, { type: 'tick' }).state
    expect(state.cars[0].position).toBe(-2)
  })

  it('moves a car while its signal is green', () => {
    const state = applyAnimalCrossingAction(startAnimalCrossing(0), { type: 'tick' }).state
    expect(state.cars[0].position).toBe(-1)
  })

  it('causes a collision when crossing traffic enters an occupied center', () => {
    const state: AnimalCrossingState = {
      ...startAnimalCrossing(0),
      signal: 'vertical',
      cars: [
        { id: 1, route: 'horizontal', position: 0 },
        { id: 2, route: 'vertical', position: -1 },
      ],
    }
    const transition = applyAnimalCrossingAction(state, { type: 'tick' })
    expect(transition.state.hearts).toBe(state.hearts - 1)
    expect(transition.events.some(event => event.type === 'collision')).toBe(true)
  })

  it('keeps every intersection clearable with real signal changes', () => {
    for (const [stageIndex, stage] of ANIMAL_CROSSING_STAGES.entries()) {
      let state = startAnimalCrossing(stageIndex)
      for (const signal of stage.solution) state = chooseSignal(state, signal)
      expect(state.status, stage.name).toBe(stageIndex === ANIMAL_CROSSING_STAGES.length - 1 ? 'finished' : 'stage-won')
      expect(state.hearts, stage.name).toBe(3)
    }
  })

  it('clears the first mixed crossing by emptying one direction before switching', () => {
    let state = startAnimalCrossing(1)
    for (const signal of [
      ...Array<Route>(7).fill('horizontal'),
      ...Array<Route>(8).fill('vertical'),
      ...Array<Route>(4).fill('horizontal'),
    ]) state = chooseSignal(state, signal)
    expect(state.status).toBe('stage-won')
    expect(state.hearts).toBe(3)
  })
})
