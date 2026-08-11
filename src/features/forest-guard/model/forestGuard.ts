export type ForestElement = 'fire' | 'water' | 'leaf'
export type ForestLane = 0 | 1 | 2

export type ForestEnemy = {
  id: string
  lane: ForestLane
  element: ForestElement
  position: number
  health: number
}

export type ForestSpawn = {
  turn: number
  lane: ForestLane
  element: ForestElement
}

export type ForestWave = {
  name: string
  spawns: readonly ForestSpawn[]
}

export const FOREST_WAVES: readonly ForestWave[] = [
  {
    name: 'はじめての しゅうげき',
    spawns: [
      { turn: 0, lane: 0, element: 'leaf' },
      { turn: 1, lane: 1, element: 'fire' },
      { turn: 2, lane: 2, element: 'water' },
    ],
  },
  {
    name: 'いれかわる モンスター',
    spawns: [
      { turn: 0, lane: 0, element: 'water' },
      { turn: 0, lane: 1, element: 'leaf' },
      { turn: 0, lane: 2, element: 'fire' },
      { turn: 3, lane: 0, element: 'fire' },
      { turn: 3, lane: 1, element: 'water' },
      { turn: 3, lane: 2, element: 'leaf' },
    ],
  },
  {
    name: 'まおうの だいこうしん',
    spawns: [
      { turn: 0, lane: 0, element: 'fire' },
      { turn: 0, lane: 1, element: 'water' },
      { turn: 0, lane: 2, element: 'leaf' },
      { turn: 2, lane: 0, element: 'leaf' },
      { turn: 2, lane: 1, element: 'fire' },
      { turn: 2, lane: 2, element: 'water' },
      { turn: 4, lane: 0, element: 'water' },
      { turn: 4, lane: 1, element: 'leaf' },
      { turn: 4, lane: 2, element: 'fire' },
    ],
  },
]

export type ForestGuardState = {
  status: 'setup' | 'playing' | 'wave-won' | 'finished' | 'lost'
  waveIndex: number
  guards: readonly [ForestElement | null, ForestElement | null, ForestElement | null]
  enemies: readonly ForestEnemy[]
  spawnCursor: number
  turn: number
  seeds: number
  hearts: number
  score: number
  defeatedCount: number
  bestHearts: number
}

export type ForestGuardAction =
  | { type: 'place-guard'; lane: ForestLane; element: ForestElement }
  | { type: 'start-wave' }
  | { type: 'tick' }
  | { type: 'next-wave' }

export type ForestGuardEvent =
  | { type: 'guard-placed'; lane: ForestLane; element: ForestElement }
  | { type: 'wave-started' }
  | { type: 'enemy-defeated'; enemyId: string; lane: ForestLane }
  | { type: 'forest-hit'; lane: ForestLane }
  | { type: 'wave-won' }
  | { type: 'game-won' }
  | { type: 'game-lost' }

export type ForestGuardTransition = {
  state: ForestGuardState
  events: readonly ForestGuardEvent[]
}

export type ForestGuardResult = {
  score: number
  defeatedCount: number
  hearts: number
  isCleared: boolean
}

const strongAgainst: Readonly<Record<ForestElement, ForestElement>> = {
  fire: 'leaf',
  leaf: 'water',
  water: 'fire',
}

export function elementDamage(guard: ForestElement, enemy: ForestElement): number {
  if (strongAgainst[guard] === enemy) return 3
  if (guard === enemy) return 1
  return 0
}

export function startForestGuard(): ForestGuardState {
  return {
    status: 'setup',
    waveIndex: 0,
    guards: [null, null, null],
    enemies: [],
    spawnCursor: 0,
    turn: 0,
    seeds: 6,
    hearts: 3,
    score: 0,
    defeatedCount: 0,
    bestHearts: 3,
  }
}

const placeGuard = (
  state: ForestGuardState,
  lane: ForestLane,
  element: ForestElement,
): ForestGuardTransition => {
  if (state.status !== 'setup' && state.status !== 'playing') return { state, events: [] }
  if (state.guards[lane] === element) return { state, events: [] }
  const cost = state.guards[lane] === null ? 2 : 1
  if (state.seeds < cost) return { state, events: [] }
  const guards = [...state.guards] as [ForestElement | null, ForestElement | null, ForestElement | null]
  guards[lane] = element
  return {
    state: { ...state, guards, seeds: state.seeds - cost },
    events: [{ type: 'guard-placed', lane, element }],
  }
}

const tick = (state: ForestGuardState): ForestGuardTransition => {
  if (state.status !== 'playing') return { state, events: [] }
  const wave = FOREST_WAVES[state.waveIndex]
  const spawning = wave.spawns
    .slice(state.spawnCursor)
    .filter((spawn) => spawn.turn === state.turn)
  const enemies: ForestEnemy[] = [
    ...state.enemies,
    ...spawning.map((spawn, index) => ({
      id: `${state.waveIndex}-${state.turn}-${state.spawnCursor + index}`,
      lane: spawn.lane,
      element: spawn.element,
      position: 4,
      health: 3,
    })),
  ]
  const afterAttack = enemies.map((enemy) => {
    const laneEnemies = enemies.filter((candidate) => candidate.lane === enemy.lane)
    const nearestPosition = Math.min(...laneEnemies.map((candidate) => candidate.position))
    const guard = state.guards[enemy.lane]
    return enemy.position === nearestPosition && guard
      ? { ...enemy, health: enemy.health - elementDamage(guard, enemy.element) }
      : enemy
  })
  const defeated = afterAttack.filter((enemy) => enemy.health <= 0)
  const moved = afterAttack
    .filter((enemy) => enemy.health > 0)
    .map((enemy) => ({ ...enemy, position: enemy.position - 1 }))
  const escaped = moved.filter((enemy) => enemy.position < 0)
  const remaining = moved.filter((enemy) => enemy.position >= 0)
  const hearts = Math.max(0, state.hearts - escaped.length)
  const spawnCursor = state.spawnCursor + spawning.length
  const turn = state.turn + 1
  const events: ForestGuardEvent[] = [
    ...defeated.map((enemy) => ({ type: 'enemy-defeated' as const, enemyId: enemy.id, lane: enemy.lane })),
    ...escaped.map((enemy) => ({ type: 'forest-hit' as const, lane: enemy.lane })),
  ]

  if (hearts === 0) {
    return {
      state: { ...state, status: 'lost', enemies: remaining, spawnCursor, turn, hearts },
      events: [...events, { type: 'game-lost' }],
    }
  }

  const waveFinished = spawnCursor >= wave.spawns.length && remaining.length === 0
  const finalWave = state.waveIndex === FOREST_WAVES.length - 1
  const status = waveFinished ? (finalWave ? 'finished' : 'wave-won') : 'playing'
  if (waveFinished) events.push({ type: finalWave ? 'game-won' : 'wave-won' })

  return {
    state: {
      ...state,
      status,
      enemies: remaining,
      spawnCursor,
      turn,
      seeds: state.seeds + defeated.length,
      hearts,
      score: state.score + defeated.length * 100 + (waveFinished ? hearts * 50 : 0),
      defeatedCount: state.defeatedCount + defeated.length,
      bestHearts: Math.max(state.bestHearts, hearts),
    },
    events,
  }
}

export function applyForestGuardAction(
  state: ForestGuardState,
  action: ForestGuardAction,
): ForestGuardTransition {
  if (action.type === 'place-guard') return placeGuard(state, action.lane, action.element)
  if (action.type === 'tick') return tick(state)
  if (action.type === 'start-wave') {
    if (state.status !== 'setup' || state.guards.some((guard) => guard === null)) return { state, events: [] }
    return { state: { ...state, status: 'playing' }, events: [{ type: 'wave-started' }] }
  }
  if (state.status !== 'wave-won') return { state, events: [] }
  return {
    state: {
      ...state,
      status: 'setup',
      waveIndex: state.waveIndex + 1,
      enemies: [],
      spawnCursor: 0,
      turn: 0,
      seeds: state.seeds + 3,
    },
    events: [],
  }
}

export function calculateForestGuardResult(state: ForestGuardState): ForestGuardResult {
  if (state.status !== 'finished' && state.status !== 'lost') {
    throw new Error('ゲーム終了前は結果を計算できません')
  }
  return {
    score: state.score,
    defeatedCount: state.defeatedCount,
    hearts: state.hearts,
    isCleared: state.status === 'finished',
  }
}
