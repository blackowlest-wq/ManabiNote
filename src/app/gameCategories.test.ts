import { describe, expect, it } from 'vitest'
import { GAME_IDS } from '../features/clear-progress/model/gameIds'
import { GAME_CATEGORY_LIST } from './gameCategories'

describe('GAME_CATEGORY_LIST', () => {
  it('registers every clearable game exactly once', () => {
    const games = GAME_CATEGORY_LIST.flatMap((category) => category.games)
    const registeredIds = games.map((game) => game.id)

    expect(new Set(registeredIds).size).toBe(registeredIds.length)
    expect([...registeredIds].sort()).toEqual([...GAME_IDS].sort())
    expect(games.every((game) => game.to === `/${game.id}`)).toBe(true)
  })
})
