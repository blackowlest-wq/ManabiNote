export type PipeDirection = 'up' | 'right' | 'down' | 'left'
export type PipeKind = 'source' | 'goal' | 'straight' | 'corner' | 'tee' | 'cross'

export type PipeTileDefinition = {
  kind: PipeKind
  initialRotation: number
  solutionRotation: number
  fixed: boolean
}

export type PipeStage = {
  id: string
  name: string
  width: number
  height: number
  par: number
  tiles: readonly (PipeTileDefinition | null)[]
}

export type PipePathState = {
  stageId: string
  rotations: readonly number[]
  turnCount: number
  status: 'playing' | 'cleared'
}

export type PipePathEvent = { type: 'pipe-rotated' } | { type: 'water-reached-goals' }

export type PipePathTransition = {
  state: PipePathState
  events: readonly PipePathEvent[]
}

const DIRECTIONS: readonly PipeDirection[] = ['up', 'right', 'down', 'left']
const OPPOSITE: Readonly<Record<PipeDirection, PipeDirection>> = {
  up: 'down',
  right: 'left',
  down: 'up',
  left: 'right',
}

const BASE_CONNECTIONS: Readonly<Record<PipeKind, readonly PipeDirection[]>> = {
  source: ['up'],
  goal: ['up'],
  straight: ['up', 'down'],
  corner: ['up', 'right'],
  tee: ['up', 'right', 'left'],
  cross: ['up', 'right', 'down', 'left'],
}

const rotateDirection = (direction: PipeDirection, rotation: number) => {
  const current = DIRECTIONS.indexOf(direction)
  return DIRECTIONS[(current + rotation) % 4] as PipeDirection
}

export const connectionsFor = (tile: PipeTileDefinition, rotation: number): readonly PipeDirection[] =>
  BASE_CONNECTIONS[tile.kind].map((direction) => rotateDirection(direction, rotation))

const pipe = (
  kind: PipeKind,
  solutionRotation: number,
  clockwiseTurnsToSolve = 1,
  fixed = false,
): PipeTileDefinition => ({
  kind,
  solutionRotation,
  initialRotation: fixed ? solutionRotation : (solutionRotation - clockwiseTurnsToSolve + 4) % 4,
  fixed,
})

const makeStage = (
  id: string,
  name: string,
  width: number,
  height: number,
  par: number,
  entries: readonly (readonly [number, PipeTileDefinition])[],
): PipeStage => {
  const tiles = Array<PipeTileDefinition | null>(width * height).fill(null)
  for (const [index, tile] of entries) tiles[index] = tile
  return { id, name, width, height, par, tiles }
}

export const PIPE_PATH_STAGES: readonly PipeStage[] = [
  makeStage('straight', 'まっすぐ みずやり', 3, 3, 1, [
    [3, pipe('source', 1, 0, true)],
    [4, pipe('straight', 1)],
    [5, pipe('goal', 3, 0, true)],
  ]),
  makeStage('first-corner', 'かどを まがれ', 3, 3, 3, [
    [0, pipe('source', 1, 0, true)],
    [1, pipe('straight', 1)],
    [2, pipe('corner', 2)],
    [5, pipe('straight', 0)],
    [8, pipe('goal', 0, 0, true)],
  ]),
  makeStage('winding-river', 'くねくね リバー', 4, 4, 10, [
    [0, pipe('source', 1, 0, true)],
    [1, pipe('straight', 1)],
    [2, pipe('corner', 2, 2)],
    [6, pipe('corner', 3)],
    [5, pipe('straight', 1)],
    [4, pipe('corner', 1)],
    [8, pipe('straight', 0)],
    [12, pipe('corner', 0)],
    [13, pipe('straight', 1)],
    [14, pipe('straight', 1)],
    [15, pipe('goal', 3, 0, true)],
  ]),
  makeStage('two-flowers', 'ふたつの おはな', 3, 3, 1, [
    [3, pipe('source', 1, 0, true)],
    [4, pipe('tee', 3)],
    [1, pipe('goal', 2, 0, true)],
    [7, pipe('goal', 0, 0, true)],
  ]),
  makeStage('branch-path', 'えだわかれ ガーデン', 4, 4, 5, [
    [4, pipe('source', 1, 0, true)],
    [5, pipe('straight', 1)],
    [6, pipe('tee', 3)],
    [2, pipe('goal', 2, 0, true)],
    [10, pipe('straight', 0)],
    [14, pipe('corner', 0)],
    [15, pipe('goal', 3, 0, true)],
  ]),
  makeStage('water-castle', 'みずの おしろ', 5, 5, 5, [
    [10, pipe('source', 1, 0, true)],
    [11, pipe('straight', 1)],
    [12, pipe('cross', 0, 0, true)],
    [13, pipe('straight', 1)],
    [14, pipe('goal', 3, 0, true)],
    [7, pipe('straight', 0)],
    [2, pipe('goal', 2, 0, true)],
    [17, pipe('straight', 0)],
    [22, pipe('goal', 0, 0, true)],
  ]),
  makeStage('mountain-stream', 'やまの くねくねみち', 5, 4, 7, [
    [0, pipe('source', 1, 0, true)],
    [1, pipe('straight', 1)],
    [2, pipe('corner', 2, 2)],
    [7, pipe('straight', 0)],
    [12, pipe('corner', 0)],
    [13, pipe('straight', 1)],
    [14, pipe('corner', 2)],
    [19, pipe('goal', 0, 0, true)],
  ]),
  makeStage('twin-garden', 'ふたまた ガーデン', 5, 3, 7, [
    [0, pipe('source', 1, 0, true)],
    [1, pipe('straight', 1)],
    [2, pipe('tee', 2)],
    [3, pipe('straight', 1)],
    [4, pipe('corner', 2)],
    [7, pipe('straight', 0)],
    [9, pipe('goal', 0, 0, true)],
    [12, pipe('corner', 0)],
    [13, pipe('straight', 1)],
    [14, pipe('goal', 3, 0, true)],
  ]),
  makeStage('cliff-garden', 'がけの おはなばたけ', 5, 5, 7, [
    [20, pipe('source', 0, 0, true)],
    [15, pipe('straight', 0)],
    [10, pipe('corner', 1)],
    [11, pipe('straight', 1)],
    [12, pipe('tee', 0)],
    [7, pipe('straight', 0)],
    [2, pipe('goal', 2, 0, true)],
    [13, pipe('straight', 1)],
    [14, pipe('corner', 3)],
    [9, pipe('straight', 0)],
    [4, pipe('goal', 2, 0, true)],
  ]),
  makeStage('reverse-river', 'ぎゃくさの かわ', 5, 5, 8, [
    [4, pipe('source', 2, 0, true)],
    [9, pipe('straight', 0)],
    [14, pipe('corner', 3)],
    [13, pipe('straight', 1)],
    [12, pipe('corner', 1)],
    [17, pipe('straight', 0)],
    [22, pipe('corner', 3)],
    [21, pipe('straight', 1)],
    [20, pipe('goal', 1, 0, true)],
  ]),
  makeStage('four-way-flowers', 'よつみち フラワー', 5, 5, 7, [
    [22, pipe('source', 0, 0, true)],
    [17, pipe('straight', 0)],
    [12, pipe('cross', 0, 0, true)],
    [7, pipe('straight', 0)],
    [2, pipe('goal', 2, 0, true)],
    [11, pipe('straight', 1)],
    [10, pipe('goal', 1, 0, true)],
    [13, pipe('straight', 1)],
    [14, pipe('goal', 3, 0, true)],
  ]),
  makeStage('rainbow-fountain', 'にじいろ ふんすい', 5, 5, 10, [
    [20, pipe('source', 1, 0, true)],
    [21, pipe('straight', 1)],
    [22, pipe('corner', 3)],
    [17, pipe('straight', 0)],
    [12, pipe('cross', 0, 0, true)],
    [11, pipe('straight', 1)],
    [10, pipe('goal', 1, 0, true)],
    [13, pipe('straight', 1)],
    [14, pipe('goal', 3, 0, true)],
    [7, pipe('straight', 0)],
    [2, pipe('tee', 2)],
    [1, pipe('straight', 1)],
    [0, pipe('goal', 1, 0, true)],
    [3, pipe('straight', 1)],
    [4, pipe('goal', 3, 0, true)],
  ]),
]

const neighborIndex = (stage: PipeStage, index: number, direction: PipeDirection) => {
  const row = Math.floor(index / stage.width)
  const column = index % stage.width
  if (direction === 'up') return row > 0 ? index - stage.width : null
  if (direction === 'right') return column < stage.width - 1 ? index + 1 : null
  if (direction === 'down') return row < stage.height - 1 ? index + stage.width : null
  return column > 0 ? index - 1 : null
}

export function startPipeStage(stage: PipeStage): PipePathState {
  return {
    stageId: stage.id,
    rotations: stage.tiles.map((tile) => tile?.initialRotation ?? 0),
    turnCount: 0,
    status: 'playing',
  }
}

export function getWateredIndexes(stage: PipeStage, state: PipePathState): ReadonlySet<number> {
  const sourceIndex = stage.tiles.findIndex((tile) => tile?.kind === 'source')
  if (sourceIndex < 0) return new Set()
  const visited = new Set<number>([sourceIndex])
  const queue = [sourceIndex]
  while (queue.length > 0) {
    const current = queue.shift() as number
    const tile = stage.tiles[current]
    if (!tile) continue
    for (const direction of connectionsFor(tile, state.rotations[current] ?? 0)) {
      const nextIndex = neighborIndex(stage, current, direction)
      if (nextIndex === null || visited.has(nextIndex)) continue
      const nextTile = stage.tiles[nextIndex]
      if (!nextTile) continue
      const nextConnections = connectionsFor(nextTile, state.rotations[nextIndex] ?? 0)
      if (!nextConnections.includes(OPPOSITE[direction])) continue
      visited.add(nextIndex)
      queue.push(nextIndex)
    }
  }
  return visited
}

export function isPipeStageSolved(stage: PipeStage, state: PipePathState) {
  const pipeIndexes = stage.tiles.flatMap((tile, index) => tile ? [index] : [])
  const watered = getWateredIndexes(stage, state)
  if (!pipeIndexes.every((index) => watered.has(index))) return false

  return pipeIndexes.every((index) => {
    const tile = stage.tiles[index]
    if (!tile) return true
    return connectionsFor(tile, state.rotations[index] ?? 0).every((direction) => {
      const nextIndex = neighborIndex(stage, index, direction)
      if (nextIndex === null) return false
      const nextTile = stage.tiles[nextIndex]
      return Boolean(nextTile && connectionsFor(nextTile, state.rotations[nextIndex] ?? 0).includes(OPPOSITE[direction]))
    })
  })
}

export function rotatePipe(stage: PipeStage, state: PipePathState, index: number): PipePathTransition {
  if (state.status !== 'playing') return { state, events: [] }
  const tile = stage.tiles[index]
  if (!tile || tile.fixed) return { state, events: [] }
  const rotations = [...state.rotations]
  rotations[index] = ((rotations[index] ?? 0) + 1) % 4
  const changed: PipePathState = {
    ...state,
    rotations,
    turnCount: state.turnCount + 1,
  }
  if (isPipeStageSolved(stage, changed)) {
    return {
      state: { ...changed, status: 'cleared' },
      events: [{ type: 'water-reached-goals' }],
    }
  }
  return { state: changed, events: [{ type: 'pipe-rotated' }] }
}

export function calculatePipeStars(stage: PipeStage, state: PipePathState) {
  if (state.status !== 'cleared') throw new Error('ステージクリア前は星を計算できません')
  if (state.turnCount <= stage.par) return 3
  if (state.turnCount <= stage.par + 3) return 2
  return 1
}
