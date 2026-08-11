import type { Position, StageDefinition, StageEntity, Tile } from './rescueMaze'

const positionOf = (rows: readonly string[], marker: string): Position => {
  const y = rows.findIndex((row) => row.includes(marker))
  if (y < 0) throw new Error(`${marker} がステージにありません`)
  return { x: rows[y]?.indexOf(marker) ?? -1, y }
}

const makeStage = (
  definition: Omit<StageDefinition, 'width' | 'height' | 'tiles' | 'playerStart' | 'entities'> & {
    rows: readonly string[]
    entities: (rows: readonly string[]) => readonly StageEntity[]
  },
): StageDefinition => {
  const width = definition.rows[0]?.length ?? 0
  if (width === 0 || definition.rows.some((row) => row.length !== width)) {
    throw new Error('ステージの行幅がそろっていません')
  }

  const tiles = definition.rows.flatMap((row) =>
    [...row].map<Tile>((cell) => cell === '#' ? 'wall' : cell === 'E' ? 'exit' : 'floor'),
  )

  return {
    id: definition.id,
    name: definition.name,
    width,
    height: definition.rows.length,
    tiles,
    playerStart: positionOf(definition.rows, 'P'),
    entities: definition.entities(definition.rows),
    parMoves: definition.parMoves,
    bonusGoals: definition.bonusGoals,
  }
}

const animal = (
  rows: readonly string[],
  marker: string,
  id: string,
  label: string,
  symbolId: string,
): StageEntity => ({ kind: 'animal', id, label, symbolId, position: positionOf(rows, marker) })

const treasure = (rows: readonly string[], id: string): StageEntity => ({
  kind: 'treasure',
  id,
  symbolId: 'ruby',
  position: positionOf(rows, 'T'),
})

export const RESCUE_MAZE_STAGES: readonly StageDefinition[] = [
  makeStage({
    id: 'rescue-1',
    name: 'ひよこを たすけよう',
    rows: ['P.##', '#..#', '#A.#', '##E#'],
    entities: (rows) => [animal(rows, 'A', 'stage-1-chick', 'ひよこ', 'chick')],
    parMoves: 5,
    bonusGoals: ['under-par', 'no-undo'],
  }),
  makeStage({
    id: 'rescue-2',
    name: 'ねこを さがそう',
    rows: ['P...', '.##.', '.A..', '.##E'],
    entities: (rows) => [animal(rows, 'A', 'stage-2-cat', 'ねこ', 'cat')],
    parMoves: 6,
    bonusGoals: ['under-par', 'no-undo'],
  }),
  makeStage({
    id: 'rescue-3',
    name: 'たからばこを みつけよう',
    rows: ['P...T', '.###.', '.A...', '.###.', '....E'],
    entities: (rows) => [
      animal(rows, 'A', 'stage-3-rabbit', 'うさぎ', 'rabbit'),
      treasure(rows, 'stage-3-ruby'),
    ],
    parMoves: 14,
    bonusGoals: ['under-par', 'all-treasures'],
  }),
  makeStage({
    id: 'rescue-4',
    name: 'かぎで とびらを あけよう',
    rows: ['P.K##', '.#D##', '.#...', '.A.#.', 'T..#E'],
    entities: (rows) => [
      { kind: 'key', id: 'stage-4-key', keyId: 'star', symbol: '★', position: positionOf(rows, 'K') },
      { kind: 'door', id: 'stage-4-door', keyId: 'star', symbol: '★', position: positionOf(rows, 'D') },
      animal(rows, 'A', 'stage-4-turtle', 'かめ', 'turtle'),
      treasure(rows, 'stage-4-ruby'),
    ],
    parMoves: 16,
    bonusGoals: ['under-par', 'all-treasures'],
  }),
  makeStage({
    id: 'rescue-5',
    name: 'ふたりを たすけよう',
    rows: ['P....T', '.###.#', '.A...#', '.#.#.#', '...B.E'],
    entities: (rows) => [
      animal(rows, 'A', 'stage-5-dog', 'いぬ', 'dog'),
      animal(rows, 'B', 'stage-5-bird', 'とり', 'bird'),
      treasure(rows, 'stage-5-ruby'),
    ],
    parMoves: 19,
    bonusGoals: ['under-par', 'all-treasures'],
  }),
  makeStage({
    id: 'rescue-6',
    name: 'へびに きをつけよう',
    rows: ['P....T', '.###.#', '.A....', '.#.#.#', '...B.E', '.#####'],
    entities: (rows) => [
      animal(rows, 'A', 'stage-6-frog', 'かえる', 'frog'),
      animal(rows, 'B', 'stage-6-mouse', 'ねずみ', 'mouse'),
      treasure(rows, 'stage-6-ruby'),
      {
        kind: 'enemy',
        id: 'stage-6-snake',
        label: 'へび',
        symbolId: 'snake',
        path: [
          { x: 3, y: 2 },
          { x: 4, y: 2 },
          { x: 4, y: 3 },
          { x: 4, y: 4 },
          { x: 3, y: 4 },
          { x: 2, y: 4 },
          { x: 3, y: 4 },
          { x: 4, y: 4 },
          { x: 4, y: 3 },
          { x: 4, y: 2 },
        ],
      },
    ],
    parMoves: 26,
    bonusGoals: ['all-treasures', 'no-catch'],
  }),
]
