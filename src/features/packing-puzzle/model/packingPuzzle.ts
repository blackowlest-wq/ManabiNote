export type PackingCell = { x: number; y: number }

export type PackingPiece = {
  id: string
  label: string
  color: string
  symbol: string
  cells: readonly PackingCell[]
  initialRotation: number
}

export type PackingPlacement = {
  pieceId: string
  anchorIndex: number
  rotation: number
}

export type PackingSolution = PackingPlacement

export type PackingStage = {
  id: string
  name: string
  width: number
  height: number
  par: number
  pieces: readonly PackingPiece[]
  targetIndexes: readonly number[]
  solution: readonly PackingSolution[]
}

export type PackingState = {
  status: 'playing' | 'cleared'
  selectedPieceId: string | null
  rotations: Readonly<Record<string, number>>
  placements: readonly PackingPlacement[]
  moveCount: number
}

export type PackingAction =
  | { type: 'select-piece'; pieceId: string }
  | { type: 'rotate-selected' }
  | { type: 'place-selected'; anchorIndex: number }
  | { type: 'remove-piece'; pieceId: string }

export type PackingEvent =
  | { type: 'piece-rotated'; pieceId: string }
  | { type: 'piece-placed'; pieceId: string }
  | { type: 'piece-removed'; pieceId: string }
  | { type: 'cannot-place' }
  | { type: 'truck-packed' }

export type PackingTransition = {
  state: PackingState
  events: readonly PackingEvent[]
}

const SHAPES = {
  domino: [{ x: 0, y: 0 }, { x: 1, y: 0 }],
  triL: [{ x: 0, y: 0 }, { x: 0, y: 1 }, { x: 1, y: 1 }],
  triI: [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 2, y: 0 }],
  square: [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 0, y: 1 }, { x: 1, y: 1 }],
  tetL: [{ x: 0, y: 0 }, { x: 0, y: 1 }, { x: 0, y: 2 }, { x: 1, y: 2 }],
  tetT: [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 2, y: 0 }, { x: 1, y: 1 }],
  zig: [{ x: 1, y: 0 }, { x: 2, y: 0 }, { x: 0, y: 1 }, { x: 1, y: 1 }],
} as const

const rotateCells = (cells: readonly PackingCell[], rotation: number): PackingCell[] => {
  let rotated = cells.map((cell) => ({ ...cell }))
  for (let turn = 0; turn < rotation % 4; turn += 1) {
    rotated = rotated.map(({ x, y }) => ({ x: -y, y: x }))
  }
  const minX = Math.min(...rotated.map(({ x }) => x))
  const minY = Math.min(...rotated.map(({ y }) => y))
  return rotated.map(({ x, y }) => ({ x: x - minX, y: y - minY }))
}

export const packingPieceCells = (piece: PackingPiece, rotation: number) => rotateCells(piece.cells, rotation)

const absoluteIndexes = (
  width: number,
  height: number,
  piece: PackingPiece,
  rotation: number,
  anchorIndex: number,
) => {
  const anchorRow = Math.floor(anchorIndex / width)
  const anchorColumn = anchorIndex % width
  const indexes: number[] = []
  for (const cell of rotateCells(piece.cells, rotation)) {
    const row = anchorRow + cell.y
    const column = anchorColumn + cell.x
    if (row < 0 || row >= height || column < 0 || column >= width) return null
    indexes.push(row * width + column)
  }
  return indexes
}

export const packingPieceIndexes = (
  stage: PackingStage,
  placement: PackingPlacement,
) => {
  const piece = stage.pieces.find((candidate) => candidate.id === placement.pieceId)
  return piece ? absoluteIndexes(stage.width, stage.height, piece, placement.rotation, placement.anchorIndex) : null
}

const piece = (
  id: string,
  label: string,
  color: string,
  symbol: string,
  cells: readonly PackingCell[],
  initialRotation: number,
): PackingPiece => ({ id, label, color, symbol, cells, initialRotation })

const makeStage = (
  id: string,
  name: string,
  width: number,
  height: number,
  par: number,
  pieces: readonly PackingPiece[],
  solution: readonly PackingSolution[],
): PackingStage => {
  const target = new Set<number>()
  for (const placement of solution) {
    const currentPiece = pieces.find((candidate) => candidate.id === placement.pieceId)
    const indexes = currentPiece && absoluteIndexes(width, height, currentPiece, placement.rotation, placement.anchorIndex)
    if (!indexes) throw new Error(`ステージ ${id} の解答が盤面からはみ出しています`)
    for (const index of indexes) {
      if (target.has(index)) throw new Error(`ステージ ${id} の解答が重なっています`)
      target.add(index)
    }
  }
  return { id, name, width, height, par, pieces, targetIndexes: [...target], solution }
}

export const PACKING_STAGES: readonly PackingStage[] = [
  (() => {
    const pieces = [
      piece('red-domino', 'あかい にもつ', '#ef6b63', '●', SHAPES.domino, 1),
      piece('blue-domino', 'あおい にもつ', '#56a8e8', '▲', SHAPES.domino, 1),
    ]
    return makeStage('first-load', 'はじめての にづみ', 4, 2, 4, pieces, [
      { pieceId: 'red-domino', anchorIndex: 0, rotation: 0 },
      { pieceId: 'blue-domino', anchorIndex: 2, rotation: 0 },
    ])
  })(),
  (() => {
    const pieces = [
      piece('orange-l', 'オレンジの にもつ', '#f0a24c', '★', SHAPES.triL, 3),
      piece('green-l', 'みどりの にもつ', '#65bf73', '◆', SHAPES.triL, 1),
    ]
    return makeStage('two-corners', 'ふたつの かど', 4, 3, 4, pieces, [
      { pieceId: 'orange-l', anchorIndex: 0, rotation: 0 },
      { pieceId: 'green-l', anchorIndex: 1, rotation: 2 },
    ])
  })(),
  (() => {
    const pieces = [
      piece('purple-square', 'しかくい にもつ', '#9f7aea', '■', SHAPES.square, 1),
      piece('yellow-long', 'ながい にもつ', '#e4bd42', '●', SHAPES.triI, 0),
      piece('pink-l', 'ピンクの にもつ', '#e976a8', '♥', SHAPES.triL, 2),
    ]
    return makeStage('three-shapes', 'かたち いろいろ', 5, 3, 6, pieces, [
      { pieceId: 'purple-square', anchorIndex: 0, rotation: 0 },
      { pieceId: 'yellow-long', anchorIndex: 2, rotation: 1 },
      { pieceId: 'pink-l', anchorIndex: 3, rotation: 0 },
    ])
  })(),
  (() => {
    const pieces = [
      piece('navy-l', 'おおきな エル', '#5076bd', 'L', SHAPES.tetL, 3),
      piece('mint-t', 'ティーの にもつ', '#52bfa5', 'T', SHAPES.tetT, 1),
      piece('red-small', 'ちいさな にもつ', '#e66363', '●', SHAPES.domino, 1),
    ]
    return makeStage('big-cargo', 'おおきな にもつ', 5, 4, 6, pieces, [
      { pieceId: 'navy-l', anchorIndex: 0, rotation: 0 },
      { pieceId: 'mint-t', anchorIndex: 2, rotation: 0 },
      { pieceId: 'red-small', anchorIndex: 12, rotation: 0 },
    ])
  })(),
  (() => {
    const pieces = [
      piece('castle-square', 'しかく', '#8a6bd1', '■', SHAPES.square, 1),
      piece('castle-t', 'ティー', '#4fbfa2', 'T', SHAPES.tetT, 3),
      piece('castle-zig', 'くねくね', '#ee8a4c', 'Z', SHAPES.zig, 2),
      piece('castle-red', 'あかい ぼう', '#e96262', '●', SHAPES.domino, 1),
      piece('castle-blue', 'あおい ぼう', '#4d9cdb', '▲', SHAPES.domino, 3),
    ]
    return makeStage('packing-master', 'にづみ マスター', 5, 5, 10, pieces, [
      { pieceId: 'castle-square', anchorIndex: 0, rotation: 0 },
      { pieceId: 'castle-t', anchorIndex: 2, rotation: 0 },
      { pieceId: 'castle-zig', anchorIndex: 10, rotation: 0 },
      { pieceId: 'castle-red', anchorIndex: 13, rotation: 0 },
      { pieceId: 'castle-blue', anchorIndex: 20, rotation: 0 },
    ])
  })(),
]

export function startPackingStage(stage: PackingStage): PackingState {
  return {
    status: 'playing',
    selectedPieceId: stage.pieces[0]?.id ?? null,
    rotations: Object.fromEntries(stage.pieces.map((current) => [current.id, current.initialRotation])),
    placements: [],
    moveCount: 0,
  }
}

const occupiedIndexes = (stage: PackingStage, placements: readonly PackingPlacement[]) => {
  const occupied = new Set<number>()
  for (const placement of placements) {
    for (const index of packingPieceIndexes(stage, placement) ?? []) occupied.add(index)
  }
  return occupied
}

export function applyPackingAction(
  stage: PackingStage,
  state: PackingState,
  action: PackingAction,
): PackingTransition {
  if (state.status === 'cleared') return { state, events: [] }

  if (action.type === 'select-piece') {
    const available = stage.pieces.some((current) => current.id === action.pieceId)
      && !state.placements.some((placement) => placement.pieceId === action.pieceId)
    return available ? { state: { ...state, selectedPieceId: action.pieceId }, events: [] } : { state, events: [] }
  }

  if (action.type === 'rotate-selected') {
    if (!state.selectedPieceId) return { state, events: [] }
    const rotation = ((state.rotations[state.selectedPieceId] ?? 0) + 1) % 4
    return {
      state: {
        ...state,
        rotations: { ...state.rotations, [state.selectedPieceId]: rotation },
        moveCount: state.moveCount + 1,
      },
      events: [{ type: 'piece-rotated', pieceId: state.selectedPieceId }],
    }
  }

  if (action.type === 'remove-piece') {
    if (!state.placements.some((placement) => placement.pieceId === action.pieceId)) return { state, events: [] }
    return {
      state: {
        ...state,
        status: 'playing',
        selectedPieceId: action.pieceId,
        placements: state.placements.filter((placement) => placement.pieceId !== action.pieceId),
        moveCount: state.moveCount + 1,
      },
      events: [{ type: 'piece-removed', pieceId: action.pieceId }],
    }
  }

  if (!state.selectedPieceId) return { state, events: [] }
  const placement: PackingPlacement = {
    pieceId: state.selectedPieceId,
    anchorIndex: action.anchorIndex,
    rotation: state.rotations[state.selectedPieceId] ?? 0,
  }
  const indexes = packingPieceIndexes(stage, placement)
  const occupied = occupiedIndexes(stage, state.placements)
  const target = new Set(stage.targetIndexes)
  const valid = indexes && indexes.every((index) => target.has(index) && !occupied.has(index))
  if (!valid) return { state, events: [{ type: 'cannot-place' }] }

  const placements = [...state.placements, placement]
  const used = occupiedIndexes(stage, placements)
  const cleared = placements.length === stage.pieces.length && stage.targetIndexes.every((index) => used.has(index))
  const nextPiece = stage.pieces.find((current) => !placements.some((currentPlacement) => currentPlacement.pieceId === current.id))
  const events: PackingEvent[] = [{ type: 'piece-placed', pieceId: placement.pieceId }]
  if (cleared) events.push({ type: 'truck-packed' })
  return {
    state: {
      ...state,
      status: cleared ? 'cleared' : 'playing',
      selectedPieceId: nextPiece?.id ?? null,
      placements,
      moveCount: state.moveCount + 1,
    },
    events,
  }
}

export function calculatePackingStars(stage: PackingStage, state: PackingState) {
  if (state.status !== 'cleared') throw new Error('ステージクリア前は星を計算できません')
  if (state.moveCount <= stage.par) return 3
  if (state.moveCount <= stage.par + 4) return 2
  return 1
}
