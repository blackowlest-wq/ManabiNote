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
  makeStage({
    id: 'rescue-7',
    name: 'スイッチで はしを かけよう',
    rows: ['P..#T', '.S.#.', '.#.H.', '.#A#.', '....E'],
    entities: (rows) => [
      {
        kind: 'switch',
        id: 'stage-7-sun-switch',
        bridgeId: 'stage-7-sun-bridge',
        symbol: '☀',
        activation: 'player',
        position: positionOf(rows, 'S'),
      },
      {
        kind: 'bridge',
        id: 'stage-7-sun-bridge',
        symbol: '☀',
        position: positionOf(rows, 'H'),
      },
      animal(rows, 'A', 'stage-7-koala', 'こあら', 'koala'),
      treasure(rows, 'stage-7-ruby'),
    ],
    parMoves: 17,
    bonusGoals: ['under-par', 'all-treasures'],
  }),
  makeStage({
    id: 'rescue-8',
    name: 'ふたつの かぎを つかおう',
    rows: ['P.KD..', '#####.', '...ML.', '.#####', 'A.T..E'],
    entities: (rows) => [
      { kind: 'key', id: 'stage-8-star-key', keyId: 'star', symbol: '★', position: positionOf(rows, 'K') },
      { kind: 'door', id: 'stage-8-star-door', keyId: 'star', symbol: '★', position: positionOf(rows, 'D') },
      { kind: 'key', id: 'stage-8-moon-key', keyId: 'moon', symbol: '☾', position: positionOf(rows, 'L') },
      { kind: 'door', id: 'stage-8-moon-door', keyId: 'moon', symbol: '☾', position: positionOf(rows, 'M') },
      animal(rows, 'A', 'stage-8-panda', 'ぱんだ', 'panda'),
      treasure(rows, 'stage-8-ruby'),
    ],
    parMoves: 19,
    bonusGoals: ['under-par', 'all-treasures'],
  }),
  makeStage({
    id: 'rescue-9',
    name: 'はこを おして はしを かけよう',
    rows: ['P.BS#', '...#T', '##H..', 'A...E'],
    entities: (rows) => [
      { kind: 'box', id: 'stage-9-box', position: positionOf(rows, 'B') },
      {
        kind: 'switch',
        id: 'stage-9-moon-switch',
        bridgeId: 'stage-9-moon-bridge',
        symbol: '☾',
        activation: 'box',
        position: positionOf(rows, 'S'),
      },
      {
        kind: 'bridge',
        id: 'stage-9-moon-bridge',
        symbol: '☾',
        position: positionOf(rows, 'H'),
      },
      animal(rows, 'A', 'stage-9-elephant', 'ぞう', 'elephant'),
      treasure(rows, 'stage-9-ruby'),
    ],
    parMoves: 15,
    bonusGoals: ['under-par', 'all-treasures'],
  }),
  makeStage({
    id: 'rescue-10',
    name: 'みんなを たすけだそう',
    rows: ['P.KD..', '.###S.', 'A###..', '####H#', 'T..#..', '..B..E'],
    entities: (rows) => [
      { kind: 'key', id: 'stage-10-star-key', keyId: 'star', symbol: '★', position: positionOf(rows, 'K') },
      { kind: 'door', id: 'stage-10-star-door', keyId: 'star', symbol: '★', position: positionOf(rows, 'D') },
      {
        kind: 'switch',
        id: 'stage-10-sun-switch',
        bridgeId: 'stage-10-sun-bridge',
        symbol: '☀',
        activation: 'player',
        position: positionOf(rows, 'S'),
      },
      {
        kind: 'bridge',
        id: 'stage-10-sun-bridge',
        symbol: '☀',
        position: positionOf(rows, 'H'),
      },
      animal(rows, 'A', 'stage-10-lion', 'らいおん', 'lion'),
      animal(rows, 'B', 'stage-10-monkey', 'さる', 'monkey'),
      treasure(rows, 'stage-10-ruby'),
      {
        kind: 'enemy',
        id: 'stage-10-snake',
        label: 'へび',
        symbolId: 'snake',
        path: [
          { x: 5, y: 1 },
          { x: 5, y: 2 },
          { x: 4, y: 2 },
          { x: 4, y: 1 },
        ],
      },
    ],
    parMoves: 30,
    bonusGoals: ['all-treasures', 'no-catch'],
  }),
]
