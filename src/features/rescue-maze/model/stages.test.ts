import { describe, expect, it } from 'vitest'
import { applyAction, calculateResult, startStage, type Direction, type RescueState, type StageDefinition } from './rescueMaze'
import { RESCUE_MAZE_STAGES } from './stages'

const directions: readonly Direction[] = ['up', 'down', 'left', 'right']

const stateKey = (state: RescueState) => JSON.stringify({
  playerPosition: state.playerPosition,
  rescuedAnimalIds: [...state.rescuedAnimalIds].sort(),
  inventoryKeyIds: [...state.inventoryKeyIds].sort(),
  collectedKeyEntityIds: [...state.collectedKeyEntityIds].sort(),
  openDoorIds: [...state.openDoorIds].sort(),
  collectedTreasureIds: [...state.collectedTreasureIds].sort(),
  activatedSwitchIds: [...state.activatedSwitchIds].sort(),
  boxStates: state.boxStates.map((box) => ({ id: box.id, position: box.position })),
  enemyStates: state.enemyStates.map((enemy) => ({ id: enemy.id, pathIndex: enemy.pathIndex })),
})

const findBestClear = (stage: StageDefinition) => {
  const started = startStage(stage)
  const queue: RescueState[] = [started]
  const visited = new Set([stateKey(started)])

  while (queue.length > 0) {
    const state = queue.shift()
    if (!state) break
    for (const direction of directions) {
      const next = applyAction(stage, state, { type: 'move', direction }).state
      if (next.status === 'cleared' && calculateResult(stage, next).stampCount === 3) return next
      const key = stateKey(next)
      if (!visited.has(key)) {
        visited.add(key)
        queue.push(next)
      }
    }
  }

  return null
}

describe('RESCUE_MAZE_STAGES', () => {
  it('provides ten ordered and valid stages ending with a combined challenge', () => {
    expect(RESCUE_MAZE_STAGES).toHaveLength(10)
    expect(RESCUE_MAZE_STAGES.map((stage) => stage.id)).toEqual([
      'rescue-1',
      'rescue-2',
      'rescue-3',
      'rescue-4',
      'rescue-5',
      'rescue-6',
      'rescue-7',
      'rescue-8',
      'rescue-9',
      'rescue-10',
    ])

    for (const stage of RESCUE_MAZE_STAGES) {
      expect(stage.tiles.filter((tile) => tile === 'exit')).toHaveLength(1)
      expect(stage.entities.some((entity) => entity.kind === 'animal')).toBe(true)
      expect(stage.bonusGoals).toHaveLength(2)
      expect(() => startStage(stage)).not.toThrow()
    }
  })

  it.each(RESCUE_MAZE_STAGES)('$name can earn all three stamps through the public game rules', (stage) => {
    const cleared = findBestClear(stage)
    expect(cleared).not.toBeNull()
    expect(cleared && calculateResult(stage, cleared).stampCount).toBe(3)
  })
})
