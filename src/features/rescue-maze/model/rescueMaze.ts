export type Position = {
  x: number
  y: number
}

export type Direction = 'up' | 'down' | 'left' | 'right'
export type Tile = 'floor' | 'wall' | 'exit'
export type BonusGoal = 'under-par' | 'no-undo' | 'all-treasures' | 'no-catch'

export type AnimalEntity = {
  kind: 'animal'
  id: string
  label: string
  symbolId: string
  position: Position
}

export type KeyEntity = {
  kind: 'key'
  id: string
  keyId: string
  symbol: string
  position: Position
}

export type DoorEntity = {
  kind: 'door'
  id: string
  keyId: string
  symbol: string
  position: Position
}

export type TreasureEntity = {
  kind: 'treasure'
  id: string
  symbolId: string
  position: Position
}

export type EnemyEntity = {
  kind: 'enemy'
  id: string
  label: string
  symbolId: string
  path: readonly Position[]
}

export type StageEntity = AnimalEntity | KeyEntity | DoorEntity | TreasureEntity | EnemyEntity

export type EnemyState = {
  id: string
  position: Position
  nextPosition: Position
  pathIndex: number
}

export type StageDefinition = {
  id: string
  name: string
  width: number
  height: number
  tiles: readonly Tile[]
  playerStart: Position
  entities: readonly StageEntity[]
  parMoves: number
  bonusGoals: readonly BonusGoal[]
}

export type RescueSnapshot = {
  playerPosition: Position
  rescuedAnimalIds: readonly string[]
  inventoryKeyIds: readonly string[]
  collectedKeyEntityIds: readonly string[]
  openDoorIds: readonly string[]
  collectedTreasureIds: readonly string[]
  enemyStates: readonly EnemyState[]
  moves: number
  status: 'playing' | 'cleared'
}

export type RescueState = RescueSnapshot & {
  stageId: string
  history: readonly RescueSnapshot[]
  undoCount: number
  caughtCount: number
}

export type PlayerAction =
  | { type: 'move'; direction: Direction }
  | { type: 'undo' }
  | { type: 'restart' }

export type GameEvent =
  | { type: 'animal-rescued'; animalId: string }
  | { type: 'key-collected'; keyId: string }
  | { type: 'door-opened'; doorId: string }
  | { type: 'door-locked'; doorId: string; keyId: string }
  | { type: 'treasure-collected'; treasureId: string }
  | { type: 'exit-blocked'; remainingAnimalIds: readonly string[] }
  | { type: 'player-caught'; enemyId: string }
  | { type: 'undone' }
  | { type: 'restarted' }
  | { type: 'stage-cleared' }

export type RescueTransition = {
  state: RescueState
  events: readonly GameEvent[]
}

export type StageResult = {
  stageId: string
  stampCount: number
  maxStampCount: number
  moves: number
  collectedTreasureIds: readonly string[]
}

const DIRECTION_OFFSETS: Record<Direction, Position> = {
  up: { x: 0, y: -1 },
  down: { x: 0, y: 1 },
  left: { x: -1, y: 0 },
  right: { x: 1, y: 0 },
}

const positionsEqual = (left: Position, right: Position) =>
  left.x === right.x && left.y === right.y

const tileAt = (stage: StageDefinition, position: Position): Tile | undefined => {
  if (position.x < 0 || position.x >= stage.width || position.y < 0 || position.y >= stage.height) {
    return undefined
  }
  return stage.tiles[position.y * stage.width + position.x]
}

const toSnapshot = (state: RescueState): RescueSnapshot => ({
  playerPosition: state.playerPosition,
  rescuedAnimalIds: state.rescuedAnimalIds,
  inventoryKeyIds: state.inventoryKeyIds,
  collectedKeyEntityIds: state.collectedKeyEntityIds,
  openDoorIds: state.openDoorIds,
  collectedTreasureIds: state.collectedTreasureIds,
  enemyStates: state.enemyStates,
  moves: state.moves,
  status: state.status,
})

export function startStage(stage: StageDefinition): RescueState {
  if (stage.width <= 0 || stage.height <= 0 || stage.tiles.length !== stage.width * stage.height) {
    throw new Error('ステージの盤面が正しくありません')
  }
  if (tileAt(stage, stage.playerStart) !== 'floor') {
    throw new Error('スタート位置が正しくありません')
  }

  const enemyStates = stage.entities
    .filter((entity): entity is EnemyEntity => entity.kind === 'enemy')
    .map((enemy) => {
      const position = enemy.path[0]
      const nextPosition = enemy.path[1]
      if (!position || !nextPosition) throw new Error('敵の移動経路が正しくありません')
      return { id: enemy.id, position, nextPosition, pathIndex: 0 }
    })

  return {
    stageId: stage.id,
    playerPosition: stage.playerStart,
    rescuedAnimalIds: [],
    inventoryKeyIds: [],
    collectedKeyEntityIds: [],
    openDoorIds: [],
    collectedTreasureIds: [],
    enemyStates,
    moves: 0,
    status: 'playing',
    history: [],
    undoCount: 0,
    caughtCount: 0,
  }
}

export function applyAction(
  stage: StageDefinition,
  state: RescueState,
  action: PlayerAction,
): RescueTransition {
  if (action.type === 'restart') {
    return { state: startStage(stage), events: [{ type: 'restarted' }] }
  }

  if (action.type === 'undo') {
    const previous = state.history[state.history.length - 1]
    if (!previous) return { state, events: [] }
    return {
      state: {
        ...state,
        ...previous,
        history: state.history.slice(0, -1),
        undoCount: state.undoCount + 1,
      },
      events: [{ type: 'undone' }],
    }
  }

  if (state.status === 'cleared') return { state, events: [] }

  const offset = DIRECTION_OFFSETS[action.direction]
  const destination = {
    x: state.playerPosition.x + offset.x,
    y: state.playerPosition.y + offset.y,
  }
  const destinationTile = tileAt(stage, destination)
  if (!destinationTile || destinationTile === 'wall') return { state, events: [] }

  if (destinationTile === 'exit') {
    const remainingAnimalIds = stage.entities
      .filter((entity) => entity.kind === 'animal' && !state.rescuedAnimalIds.includes(entity.id))
      .map((entity) => entity.id)
    if (remainingAnimalIds.length > 0) {
      return { state, events: [{ type: 'exit-blocked', remainingAnimalIds }] }
    }
  }

  const occupyingEnemy = state.enemyStates.find((enemy) => positionsEqual(enemy.position, destination))
  if (occupyingEnemy) {
    return {
      state: { ...state, caughtCount: state.caughtCount + 1 },
      events: [{ type: 'player-caught', enemyId: occupyingEnemy.id }],
    }
  }

  const events: GameEvent[] = []
  let inventoryKeyIds = [...state.inventoryKeyIds]
  const collectedKeyEntityIds = [...state.collectedKeyEntityIds]
  const openDoorIds = [...state.openDoorIds]
  const collectedTreasureIds = [...state.collectedTreasureIds]

  const door = stage.entities.find(
    (entity): entity is DoorEntity => entity.kind === 'door' && positionsEqual(entity.position, destination),
  )
  if (door && !openDoorIds.includes(door.id)) {
    if (!inventoryKeyIds.includes(door.keyId)) {
      return { state, events: [{ type: 'door-locked', doorId: door.id, keyId: door.keyId }] }
    }
    inventoryKeyIds = inventoryKeyIds.filter((keyId) => keyId !== door.keyId)
    openDoorIds.push(door.id)
    events.push({ type: 'door-opened', doorId: door.id })
  }

  const key = stage.entities.find(
    (entity): entity is KeyEntity => entity.kind === 'key' && positionsEqual(entity.position, destination),
  )
  if (key && !collectedKeyEntityIds.includes(key.id)) {
    collectedKeyEntityIds.push(key.id)
    inventoryKeyIds.push(key.keyId)
    events.push({ type: 'key-collected', keyId: key.keyId })
  }

  const treasure = stage.entities.find(
    (entity) => entity.kind === 'treasure' && positionsEqual(entity.position, destination),
  )
  if (treasure && !collectedTreasureIds.includes(treasure.id)) {
    collectedTreasureIds.push(treasure.id)
    events.push({ type: 'treasure-collected', treasureId: treasure.id })
  }

  const rescuedAnimalIds = [...state.rescuedAnimalIds]
  const animal = stage.entities.find(
    (entity) => entity.kind === 'animal' && positionsEqual(entity.position, destination),
  )
  if (animal && !rescuedAnimalIds.includes(animal.id)) {
    rescuedAnimalIds.push(animal.id)
    events.push({ type: 'animal-rescued', animalId: animal.id })
  }

  const allAnimalsRescued = stage.entities
    .filter((entity) => entity.kind === 'animal')
    .every((entity) => rescuedAnimalIds.includes(entity.id))
  const status = destinationTile === 'exit' && allAnimalsRescued ? 'cleared' : 'playing'
  if (status === 'cleared') events.push({ type: 'stage-cleared' })

  let enemyStates = state.enemyStates
  if (status !== 'cleared') {
    enemyStates = state.enemyStates.map((enemyState) => {
      const enemy = stage.entities.find(
        (entity): entity is EnemyEntity => entity.kind === 'enemy' && entity.id === enemyState.id,
      )
      if (!enemy) throw new Error('敵の定義が見つかりません')
      const pathIndex = (enemyState.pathIndex + 1) % enemy.path.length
      const nextPathIndex = (pathIndex + 1) % enemy.path.length
      return {
        id: enemy.id,
        position: enemy.path[pathIndex] as Position,
        nextPosition: enemy.path[nextPathIndex] as Position,
        pathIndex,
      }
    })

    const catchingEnemy = enemyStates.find((enemy) => positionsEqual(enemy.position, destination))
    if (catchingEnemy) {
      return {
        state: { ...state, caughtCount: state.caughtCount + 1 },
        events: [{ type: 'player-caught', enemyId: catchingEnemy.id }],
      }
    }
  }

  return {
    state: {
      ...state,
      playerPosition: destination,
      rescuedAnimalIds,
      inventoryKeyIds,
      collectedKeyEntityIds,
      openDoorIds,
      collectedTreasureIds,
      enemyStates,
      moves: state.moves + 1,
      status,
      history: [...state.history, toSnapshot(state)],
    },
    events,
  }
}

export function calculateResult(stage: StageDefinition, state: RescueState): StageResult {
  if (state.status !== 'cleared') throw new Error('クリアしていないステージは評価できません')

  const treasureIds = stage.entities
    .filter((entity): entity is TreasureEntity => entity.kind === 'treasure')
    .map((treasure) => treasure.id)
  const achievedBonusCount = stage.bonusGoals.filter((goal) => {
    switch (goal) {
      case 'under-par':
        return state.moves <= stage.parMoves
      case 'no-undo':
        return state.undoCount === 0
      case 'all-treasures':
        return treasureIds.every((treasureId) => state.collectedTreasureIds.includes(treasureId))
      case 'no-catch':
        return state.caughtCount === 0
    }
  }).length

  return {
    stageId: stage.id,
    stampCount: 1 + achievedBonusCount,
    maxStampCount: 1 + stage.bonusGoals.length,
    moves: state.moves,
    collectedTreasureIds: state.collectedTreasureIds,
  }
}
