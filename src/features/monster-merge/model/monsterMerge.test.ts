import { describe, expect, it } from 'vitest'
import { applyMonsterMove, startMonsterMerge, type MonsterMergeState } from './monsterMerge'

const alwaysFirst = () => 0

describe('monsterMerge', () => {
  it('starts with two eggs on a four by four board', () => {
    const state = startMonsterMerge(alwaysFirst)

    expect(state.status).toBe('playing')
    expect(state.board).toHaveLength(16)
    expect(state.board.filter((level) => level === 1)).toHaveLength(2)
    expect(state.board.filter(Boolean)).toHaveLength(2)
    expect(state.highestLevel).toBe(1)
    expect(state.discoveredLevels).toEqual([1])
  })

  it('slides two matching monsters together and discovers their evolution', () => {
    const state: MonsterMergeState = {
      status: 'playing',
      board: [1, null, 1, null, ...Array(12).fill(null)],
      score: 0,
      combo: 0,
      bestCombo: 0,
      highestLevel: 1,
      discoveredLevels: [1],
      moveCount: 0,
    }

    const transition = applyMonsterMove(state, 'left', alwaysFirst)

    expect(transition.state.board.slice(0, 4)).toEqual([2, 1, null, null])
    expect(transition.state.score).toBe(20)
    expect(transition.state.combo).toBe(1)
    expect(transition.state.highestLevel).toBe(2)
    expect(transition.state.discoveredLevels).toEqual([1, 2])
    expect(transition.events).toContainEqual({ type: 'monster-discovered', level: 2 })
  })
})
