import { describe, expect, it } from 'vitest'
import {
  applyForestGuardAction,
  elementDamage,
  FOREST_WAVES,
  startForestGuard,
  type ForestGuardState,
} from './forestGuard'

describe('forestGuard', () => {
  it('makes the circular element advantage part of combat', () => {
    expect(elementDamage('fire', 'leaf')).toBe(3)
    expect(elementDamage('leaf', 'water')).toBe(3)
    expect(elementDamage('water', 'fire')).toBe(3)
    expect(elementDamage('fire', 'water')).toBe(0)
    expect(elementDamage('fire', 'fire')).toBe(1)
  })

  it('spends seeds to place guards in lanes', () => {
    const state = startForestGuard()

    const placed = applyForestGuardAction(state, { type: 'place-guard', lane: 0, element: 'fire' })

    expect(placed.state.guards[0]).toBe('fire')
    expect(placed.state.seeds).toBe(4)
    expect(placed.events).toContainEqual({ type: 'guard-placed', lane: 0, element: 'fire' })
  })

  it('lets a matching guard stop an incoming monster automatically', () => {
    const setup = startForestGuard()
    const state: ForestGuardState = {
      ...setup,
      status: 'playing',
      guards: ['fire', 'water', 'leaf'],
      enemies: [],
      spawnCursor: 0,
      turn: 0,
    }

    const fought = applyForestGuardAction(state, { type: 'tick' })

    expect(fought.state.defeatedCount).toBe(1)
    expect(fought.state.score).toBeGreaterThan(0)
    expect(fought.events.some((event) => event.type === 'enemy-defeated')).toBe(true)
  })

  it('keeps all three waves winnable by reacting to the incoming elements', () => {
    const counter = { fire: 'water', water: 'leaf', leaf: 'fire' } as const
    let state = startForestGuard()

    for (let safety = 0; safety < 50 && state.status !== 'finished'; safety += 1) {
      if (state.status === 'wave-won') {
        state = applyForestGuardAction(state, { type: 'next-wave' }).state
        continue
      }
      const wave = FOREST_WAVES[state.waveIndex]
      const spawning = wave.spawns.filter((spawn) => spawn.turn === state.turn)
      for (const spawn of spawning) {
        state = applyForestGuardAction(state, {
          type: 'place-guard',
          lane: spawn.lane,
          element: counter[spawn.element],
        }).state
      }
      if (state.status === 'setup') {
        for (const lane of [0, 1, 2] as const) {
          if (state.guards[lane] === null) {
            const first = wave.spawns.find((spawn) => spawn.lane === lane)
            if (first) state = applyForestGuardAction(state, { type: 'place-guard', lane, element: counter[first.element] }).state
          }
        }
        state = applyForestGuardAction(state, { type: 'start-wave' }).state
      }
      state = applyForestGuardAction(state, { type: 'tick' }).state
    }

    expect(state.status).toBe('finished')
    expect(state.hearts).toBe(3)
  })
})
