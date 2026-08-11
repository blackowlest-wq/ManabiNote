export type MonsterLevel = 1 | 2 | 3 | 4 | 5 | 6

export type MonsterMergeState = {
  status: 'playing' | 'cleared' | 'stuck'
  board: readonly (MonsterLevel | null)[]
  score: number
  combo: number
  bestCombo: number
  highestLevel: MonsterLevel
  discoveredLevels: readonly MonsterLevel[]
  moveCount: number
}

export type MonsterMoveDirection = 'up' | 'down' | 'left' | 'right'

export type MonsterMergeEvent =
  | { type: 'monsters-merged'; level: MonsterLevel }
  | { type: 'monster-discovered'; level: MonsterLevel }
  | { type: 'move-blocked' }
  | { type: 'game-cleared' }
  | { type: 'board-stuck' }

export type MonsterMergeTransition = {
  state: MonsterMergeState
  events: readonly MonsterMergeEvent[]
}

export const MONSTER_LEVELS: Readonly<Record<MonsterLevel, { name: string; emoji: string }>> = {
  1: { name: 'たまご', emoji: '🥚' },
  2: { name: 'ひよこ', emoji: '🐣' },
  3: { name: 'ふくろう', emoji: '🦉' },
  4: { name: 'こドラゴン', emoji: '🐲' },
  5: { name: 'ドラゴン', emoji: '🐉' },
  6: { name: 'ほしドラゴン', emoji: '🌟' },
}

export const MONSTER_CLEAR_LEVEL: MonsterLevel = 5

const BOARD_SIZE = 16

const spawnMonster = (
  board: readonly (MonsterLevel | null)[],
  random: () => number,
): (MonsterLevel | null)[] => {
  const emptyIndexes = board.flatMap((level, index) => level === null ? [index] : [])
  if (emptyIndexes.length === 0) return [...board]
  const pick = Math.floor(Math.min(Math.max(random(), 0), 0.999999) * emptyIndexes.length)
  const spawnIndex = emptyIndexes[pick] ?? emptyIndexes[0]
  const next = [...board]
  next[spawnIndex] = 1
  return next
}

export function startMonsterMerge(random: () => number = Math.random): MonsterMergeState {
  const empty = Array<MonsterLevel | null>(BOARD_SIZE).fill(null)
  const board = spawnMonster(spawnMonster(empty, random), random)
  return {
    status: 'playing',
    board,
    score: 0,
    combo: 0,
    bestCombo: 0,
    highestLevel: 1,
    discoveredLevels: [1],
    moveCount: 0,
  }
}

const lineIndexesFor = (direction: MonsterMoveDirection): readonly number[][] => {
  if (direction === 'left') {
    return Array.from({ length: 4 }, (_, row) => [0, 1, 2, 3].map((column) => row * 4 + column))
  }
  if (direction === 'right') {
    return Array.from({ length: 4 }, (_, row) => [3, 2, 1, 0].map((column) => row * 4 + column))
  }
  if (direction === 'up') {
    return Array.from({ length: 4 }, (_, column) => [0, 1, 2, 3].map((row) => row * 4 + column))
  }
  return Array.from({ length: 4 }, (_, column) => [3, 2, 1, 0].map((row) => row * 4 + column))
}

const slideLine = (levels: readonly (MonsterLevel | null)[]) => {
  const compact = levels.filter((level): level is MonsterLevel => level !== null)
  const result: (MonsterLevel | null)[] = []
  const mergedLevels: MonsterLevel[] = []
  for (let index = 0; index < compact.length; index += 1) {
    const current = compact[index]
    const next = compact[index + 1]
    if (current === next && current < 6) {
      const merged = (current + 1) as MonsterLevel
      result.push(merged)
      mergedLevels.push(merged)
      index += 1
    } else {
      result.push(current)
    }
  }
  while (result.length < 4) result.push(null)
  return { levels: result, mergedLevels }
}

const moveBoard = (board: readonly (MonsterLevel | null)[], direction: MonsterMoveDirection) => {
  const next = [...board]
  const mergedLevels: MonsterLevel[] = []
  for (const indexes of lineIndexesFor(direction)) {
    const moved = slideLine(indexes.map((index) => board[index] ?? null))
    indexes.forEach((boardIndex, lineIndex) => {
      next[boardIndex] = moved.levels[lineIndex] ?? null
    })
    mergedLevels.push(...moved.mergedLevels)
  }
  return { board: next, mergedLevels }
}

const boardsMatch = (
  first: readonly (MonsterLevel | null)[],
  second: readonly (MonsterLevel | null)[],
) => first.every((level, index) => level === second[index])

export const canMonsterBoardMove = (board: readonly (MonsterLevel | null)[]) => {
  if (board.some((level) => level === null)) return true
  for (let row = 0; row < 4; row += 1) {
    for (let column = 0; column < 4; column += 1) {
      const level = board[row * 4 + column]
      if (level === null || level === 6) continue
      if (column < 3 && board[row * 4 + column + 1] === level) return true
      if (row < 3 && board[(row + 1) * 4 + column] === level) return true
    }
  }
  return false
}

export function applyMonsterMove(
  state: MonsterMergeState,
  direction: MonsterMoveDirection,
  random: () => number = Math.random,
): MonsterMergeTransition {
  if (state.status !== 'playing') return { state, events: [] }
  const moved = moveBoard(state.board, direction)
  if (boardsMatch(state.board, moved.board)) {
    return { state, events: [{ type: 'move-blocked' }] }
  }

  const board = spawnMonster(moved.board, random)
  const combo = moved.mergedLevels.length > 0 ? state.combo + 1 : 0
  const mergedScore = moved.mergedLevels.reduce((total, level) => total + level * 10, 0)
  const highestLevel = Math.max(state.highestLevel, ...board.filter((level): level is MonsterLevel => level !== null)) as MonsterLevel
  const discoveredLevels = Array.from(new Set([...state.discoveredLevels, ...moved.mergedLevels])).sort() as MonsterLevel[]
  const status = highestLevel >= MONSTER_CLEAR_LEVEL ? 'cleared' : canMonsterBoardMove(board) ? 'playing' : 'stuck'
  const newlyDiscovered = discoveredLevels.filter((level) => !state.discoveredLevels.includes(level))
  const events: MonsterMergeEvent[] = [
    ...moved.mergedLevels.map((level): MonsterMergeEvent => ({ type: 'monsters-merged', level })),
    ...newlyDiscovered.map((level): MonsterMergeEvent => ({ type: 'monster-discovered', level })),
  ]
  if (status === 'cleared') events.push({ type: 'game-cleared' })
  if (status === 'stuck') events.push({ type: 'board-stuck' })

  return {
    state: {
      ...state,
      status,
      board,
      score: state.score + mergedScore * Math.max(1, combo),
      combo,
      bestCombo: Math.max(state.bestCombo, combo),
      highestLevel,
      discoveredLevels,
      moveCount: state.moveCount + 1,
    },
    events,
  }
}
