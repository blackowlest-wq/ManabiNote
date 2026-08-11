import { describe, expect, it } from 'vitest'
import { applyAction, calculateResult, startStage, type StageDefinition } from './rescueMaze'

const firstRescueStage: StageDefinition = {
  id: 'test-rescue',
  name: 'はじめての きゅうしゅつ',
  width: 3,
  height: 1,
  tiles: ['floor', 'floor', 'exit'],
  playerStart: { x: 0, y: 0 },
  entities: [
    { kind: 'animal', id: 'chick', label: 'ひよこ', symbolId: 'chick', position: { x: 1, y: 0 } },
  ],
  parMoves: 2,
  bonusGoals: ['under-par', 'no-undo'],
}

describe('rescueMaze', () => {
  it('rescues an animal by moving onto it and clears at the exit', () => {
    const started = startStage(firstRescueStage)

    const rescued = applyAction(firstRescueStage, started, { type: 'move', direction: 'right' })
    const cleared = applyAction(firstRescueStage, rescued.state, { type: 'move', direction: 'right' })

    expect(rescued.state.rescuedAnimalIds).toEqual(['chick'])
    expect(rescued.events).toEqual([{ type: 'animal-rescued', animalId: 'chick' }])
    expect(cleared.state.status).toBe('cleared')
    expect(cleared.state.moves).toBe(2)
    expect(cleared.events).toContainEqual({ type: 'stage-cleared' })
  })

  it('keeps the exit closed until every animal is rescued', () => {
    const stage: StageDefinition = {
      ...firstRescueStage,
      width: 2,
      height: 2,
      tiles: ['floor', 'exit', 'floor', 'floor'],
      entities: [
        { kind: 'animal', id: 'cat', label: 'ねこ', symbolId: 'cat', position: { x: 0, y: 1 } },
      ],
    }

    const result = applyAction(stage, startStage(stage), { type: 'move', direction: 'right' })

    expect(result.state.playerPosition).toEqual({ x: 0, y: 0 })
    expect(result.state.moves).toBe(0)
    expect(result.events).toEqual([{ type: 'exit-blocked', remainingAnimalIds: ['cat'] }])
  })

  it('collects a key and uses it to open the matching door', () => {
    const stage: StageDefinition = {
      id: 'test-door',
      name: 'かぎを みつけよう',
      width: 5,
      height: 1,
      tiles: ['floor', 'floor', 'floor', 'floor', 'exit'],
      playerStart: { x: 0, y: 0 },
      entities: [
        { kind: 'key', id: 'star-key', keyId: 'star', symbol: '★', position: { x: 1, y: 0 } },
        { kind: 'door', id: 'star-door', keyId: 'star', symbol: '★', position: { x: 2, y: 0 } },
        { kind: 'animal', id: 'rabbit', label: 'うさぎ', symbolId: 'rabbit', position: { x: 3, y: 0 } },
      ],
      parMoves: 4,
      bonusGoals: ['under-par', 'no-undo'],
    }

    const withKey = applyAction(stage, startStage(stage), { type: 'move', direction: 'right' })
    const opened = applyAction(stage, withKey.state, { type: 'move', direction: 'right' })

    expect(withKey.state.inventoryKeyIds).toEqual(['star'])
    expect(withKey.events).toEqual([{ type: 'key-collected', keyId: 'star' }])
    expect(opened.state.openDoorIds).toEqual(['star-door'])
    expect(opened.state.inventoryKeyIds).toEqual([])
    expect(opened.events).toEqual([{ type: 'door-opened', doorId: 'star-door' }])
  })

  it('collects an optional treasure without making it a clear requirement', () => {
    const stage: StageDefinition = {
      ...firstRescueStage,
      width: 4,
      tiles: ['floor', 'floor', 'floor', 'exit'],
      entities: [
        { kind: 'treasure', id: 'ruby', symbolId: 'ruby', position: { x: 1, y: 0 } },
        { kind: 'animal', id: 'chick', label: 'ひよこ', symbolId: 'chick', position: { x: 2, y: 0 } },
      ],
      parMoves: 3,
      bonusGoals: ['under-par', 'all-treasures'],
    }

    const collected = applyAction(stage, startStage(stage), { type: 'move', direction: 'right' })

    expect(collected.state.collectedTreasureIds).toEqual(['ruby'])
    expect(collected.events).toEqual([{ type: 'treasure-collected', treasureId: 'ruby' }])
  })

  it('keeps water blocked until the player activates its switch', () => {
    const stage: StageDefinition = {
      id: 'test-bridge',
      name: 'はしを かけよう',
      width: 4,
      height: 2,
      tiles: ['floor', 'floor', 'floor', 'exit', 'floor', 'wall', 'wall', 'wall'],
      playerStart: { x: 0, y: 0 },
      entities: [
        { kind: 'switch', id: 'sun-switch', bridgeId: 'sun-bridge', symbol: '☀', activation: 'player', position: { x: 0, y: 1 } },
        { kind: 'bridge', id: 'sun-bridge', symbol: '☀', position: { x: 1, y: 0 } },
        { kind: 'animal', id: 'koala', label: 'こあら', symbolId: 'koala', position: { x: 2, y: 0 } },
      ],
      parMoves: 5,
      bonusGoals: ['under-par', 'no-undo'],
    }

    const blocked = applyAction(stage, startStage(stage), { type: 'move', direction: 'right' })
    const activated = applyAction(stage, blocked.state, { type: 'move', direction: 'down' })
    const returned = applyAction(stage, activated.state, { type: 'move', direction: 'up' })
    const crossed = applyAction(stage, returned.state, { type: 'move', direction: 'right' })

    expect(blocked.events).toEqual([{ type: 'bridge-blocked', bridgeId: 'sun-bridge' }])
    expect(blocked.state.moves).toBe(0)
    expect(activated.state.activatedSwitchIds).toEqual(['sun-switch'])
    expect(activated.events).toEqual([{ type: 'bridge-activated', bridgeId: 'sun-bridge' }])
    expect(crossed.state.playerPosition).toEqual({ x: 1, y: 0 })
  })

  it('pushes a box onto its switch to activate a bridge', () => {
    const stage: StageDefinition = {
      id: 'test-box-switch',
      name: 'はこを おそう',
      width: 6,
      height: 1,
      tiles: ['floor', 'floor', 'floor', 'floor', 'floor', 'exit'],
      playerStart: { x: 0, y: 0 },
      entities: [
        { kind: 'box', id: 'box', position: { x: 1, y: 0 } },
        { kind: 'switch', id: 'moon-switch', bridgeId: 'moon-bridge', symbol: '☾', activation: 'box', position: { x: 2, y: 0 } },
        { kind: 'bridge', id: 'moon-bridge', symbol: '☾', position: { x: 3, y: 0 } },
        { kind: 'animal', id: 'panda', label: 'ぱんだ', symbolId: 'panda', position: { x: 4, y: 0 } },
      ],
      parMoves: 5,
      bonusGoals: ['under-par', 'no-undo'],
    }

    const pushed = applyAction(stage, startStage(stage), { type: 'move', direction: 'right' })

    expect(pushed.state.playerPosition).toEqual({ x: 1, y: 0 })
    expect(pushed.state.boxStates).toEqual([{ id: 'box', position: { x: 2, y: 0 } }])
    expect(pushed.state.activatedSwitchIds).toEqual(['moon-switch'])
    expect(pushed.events).toEqual([
      { type: 'box-pushed', boxId: 'box' },
      { type: 'bridge-activated', bridgeId: 'moon-bridge' },
    ])
  })

  it('undoes the previous turn including collected items', () => {
    const stage: StageDefinition = {
      ...firstRescueStage,
      entities: [
        { kind: 'key', id: 'star-key', keyId: 'star', symbol: '★', position: { x: 1, y: 0 } },
        ...firstRescueStage.entities,
      ],
    }
    const moved = applyAction(stage, startStage(stage), { type: 'move', direction: 'right' })

    const undone = applyAction(stage, moved.state, { type: 'undo' })

    expect(undone.state.playerPosition).toEqual({ x: 0, y: 0 })
    expect(undone.state.inventoryKeyIds).toEqual([])
    expect(undone.state.collectedKeyEntityIds).toEqual([])
    expect(undone.state.moves).toBe(0)
    expect(undone.state.undoCount).toBe(1)
    expect(undone.events).toEqual([{ type: 'undone' }])
  })

  it('moves an enemy after the player and returns the player to safety when caught', () => {
    const stage: StageDefinition = {
      id: 'test-enemy',
      name: 'きをつけて すすもう',
      width: 4,
      height: 1,
      tiles: ['floor', 'floor', 'floor', 'exit'],
      playerStart: { x: 0, y: 0 },
      entities: [
        {
          kind: 'enemy',
          id: 'snake',
          label: 'へび',
          symbolId: 'snake',
          path: [{ x: 2, y: 0 }, { x: 1, y: 0 }],
        },
      ],
      parMoves: 3,
      bonusGoals: ['under-par', 'no-catch'],
    }

    const started = startStage(stage)
    expect(started.enemyStates).toEqual([
      { id: 'snake', position: { x: 2, y: 0 }, nextPosition: { x: 1, y: 0 }, pathIndex: 0 },
    ])

    const caught = applyAction(stage, started, { type: 'move', direction: 'right' })

    expect(caught.state.playerPosition).toEqual({ x: 0, y: 0 })
    expect(caught.state.moves).toBe(0)
    expect(caught.state.caughtCount).toBe(1)
    expect(caught.events).toEqual([{ type: 'player-caught', enemyId: 'snake' }])
  })

  it('awards one clear stamp and two optional challenge stamps', () => {
    const rescued = applyAction(firstRescueStage, startStage(firstRescueStage), { type: 'move', direction: 'right' })
    const cleared = applyAction(firstRescueStage, rescued.state, { type: 'move', direction: 'right' })

    expect(calculateResult(firstRescueStage, cleared.state)).toEqual({
      stageId: 'test-rescue',
      stampCount: 3,
      maxStampCount: 3,
      moves: 2,
      collectedTreasureIds: [],
    })
  })
})
