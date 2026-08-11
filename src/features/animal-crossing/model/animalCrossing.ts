export type Route = 'horizontal' | 'vertical'

export type AnimalCrossingStage = {
  name: string
  spawns: readonly (Route | null)[]
  tickLimit: number
  solution: readonly Route[]
  intervalMs: number
}

export const ANIMAL_CROSSING_STAGES: readonly AnimalCrossingStage[] = [
  { name: 'よこみちを とおそう', spawns: ['horizontal', null, 'horizontal', null, 'horizontal'], tickLimit: 20, solution: Array<Route>(8).fill('horizontal'), intervalMs: 850 },
  { name: 'はじめての きりかえ', spawns: ['horizontal', 'vertical', null, 'horizontal', 'vertical', null, 'horizontal', 'vertical'], tickLimit: 30, solution: [...Array<Route>(7).fill('horizontal'), ...Array<Route>(8).fill('vertical'), ...Array<Route>(4).fill('horizontal')], intervalMs: 800 },
  { name: 'つぎつぎ こうさてん', spawns: ['horizontal', 'horizontal', null, 'horizontal', 'vertical', 'vertical', null, 'vertical', 'horizontal', 'horizontal'], tickLimit: 38, solution: [...Array<Route>(7).fill('horizontal'), ...Array<Route>(7).fill('vertical'), ...Array<Route>(5).fill('horizontal')], intervalMs: 750 },
  { name: 'どうぶつタウン', spawns: ['horizontal', 'horizontal', 'horizontal', null, 'vertical', 'vertical', 'vertical', null, 'horizontal', 'horizontal', null, 'vertical', 'vertical'], tickLimit: 46, solution: [...Array<Route>(6).fill('horizontal'), ...Array<Route>(6).fill('vertical'), ...Array<Route>(5).fill('horizontal'), ...Array<Route>(5).fill('vertical')], intervalMs: 700 },
  { name: 'たてみち ラッシュ', spawns: ['vertical', 'horizontal', null, 'vertical', 'horizontal', null, 'vertical', 'horizontal'], tickLimit: 30, solution: [...Array<Route>(7).fill('vertical'), ...Array<Route>(8).fill('horizontal'), ...Array<Route>(4).fill('vertical')], intervalMs: 680 },
  { name: 'もりの おおどおり', spawns: ['vertical', 'vertical', null, 'vertical', 'horizontal', 'horizontal', null, 'horizontal', 'vertical', 'vertical'], tickLimit: 38, solution: [...Array<Route>(7).fill('vertical'), ...Array<Route>(7).fill('horizontal'), ...Array<Route>(5).fill('vertical')], intervalMs: 650 },
  { name: 'うみべの こうさてん', spawns: ['vertical', 'vertical', 'vertical', null, 'horizontal', 'horizontal', 'horizontal', null, 'vertical', 'vertical', null, 'horizontal', 'horizontal'], tickLimit: 46, solution: [...Array<Route>(6).fill('vertical'), ...Array<Route>(6).fill('horizontal'), ...Array<Route>(5).fill('vertical'), ...Array<Route>(5).fill('horizontal')], intervalMs: 620 },
  { name: 'ゆうやけ ラッシュ', spawns: ['horizontal', 'vertical', null, 'horizontal', 'vertical', null, 'horizontal', 'vertical'], tickLimit: 30, solution: [...Array<Route>(7).fill('horizontal'), ...Array<Route>(8).fill('vertical'), ...Array<Route>(4).fill('horizontal')], intervalMs: 590 },
  { name: 'まちなか こうさてん', spawns: ['horizontal', 'horizontal', null, 'horizontal', 'vertical', 'vertical', null, 'vertical', 'horizontal', 'horizontal'], tickLimit: 38, solution: [...Array<Route>(7).fill('horizontal'), ...Array<Route>(7).fill('vertical'), ...Array<Route>(5).fill('horizontal')], intervalMs: 560 },
  { name: 'ハイスピード タウン', spawns: ['horizontal', 'horizontal', 'horizontal', null, 'vertical', 'vertical', 'vertical', null, 'horizontal', 'horizontal', null, 'vertical', 'vertical'], tickLimit: 46, solution: [...Array<Route>(6).fill('horizontal'), ...Array<Route>(6).fill('vertical'), ...Array<Route>(5).fill('horizontal'), ...Array<Route>(5).fill('vertical')], intervalMs: 530 },
  { name: 'レインボー こうさてん', spawns: ['vertical', 'vertical', 'vertical', null, 'horizontal', 'horizontal', 'horizontal', null, 'vertical', 'vertical', null, 'horizontal', 'horizontal'], tickLimit: 46, solution: [...Array<Route>(6).fill('vertical'), ...Array<Route>(6).fill('horizontal'), ...Array<Route>(5).fill('vertical'), ...Array<Route>(5).fill('horizontal')], intervalMs: 500 },
  { name: 'しんごう チャンピオン', spawns: ['horizontal', 'horizontal', 'horizontal', null, 'vertical', 'vertical', 'vertical', null, 'horizontal', 'horizontal', null, 'vertical', 'vertical'], tickLimit: 46, solution: [...Array<Route>(6).fill('horizontal'), ...Array<Route>(6).fill('vertical'), ...Array<Route>(5).fill('horizontal'), ...Array<Route>(5).fill('vertical')], intervalMs: 470 },
]

export type AnimalCar = { id: number; route: Route; position: number }

export type AnimalCrossingState = {
  status: 'playing' | 'failed' | 'stage-won' | 'finished'
  stageIndex: number
  signal: Route
  cars: readonly AnimalCar[]
  spawnCursor: number
  nextCarId: number
  ticks: number
  hearts: number
  delivered: number
  combo: number
  bestCombo: number
  stageStars: number
  totalStars: number
  score: number
}

export type AnimalCrossingAction =
  | { type: 'set-signal'; signal: Route }
  | { type: 'tick' }
  | { type: 'retry' }
  | { type: 'next-stage' }

export type AnimalCrossingEvent =
  | { type: 'signal-changed'; signal: Route }
  | { type: 'car-spawned'; route: Route }
  | { type: 'car-delivered'; count: number }
  | { type: 'collision' }
  | { type: 'stage-won' }
  | { type: 'stage-lost' }
  | { type: 'game-finished' }

export type AnimalCrossingTransition = { state: AnimalCrossingState; events: readonly AnimalCrossingEvent[] }

function initialStage(stageIndex: number, totals = { totalStars: 0, score: 0, bestCombo: 0 }): AnimalCrossingState {
  if (!ANIMAL_CROSSING_STAGES[stageIndex]) throw new Error('存在しないステージです')
  return {
    status: 'playing',
    stageIndex,
    signal: 'horizontal',
    cars: [],
    spawnCursor: 0,
    nextCarId: 1,
    ticks: 0,
    hearts: 3,
    delivered: 0,
    combo: 0,
    bestCombo: totals.bestCombo,
    stageStars: 0,
    totalStars: totals.totalStars,
    score: totals.score,
  }
}

export function startAnimalCrossing(stageIndex = 0): AnimalCrossingState {
  return initialStage(stageIndex)
}

export function applyAnimalCrossingAction(state: AnimalCrossingState, action: AnimalCrossingAction): AnimalCrossingTransition {
  if (action.type === 'retry') {
    if (state.status !== 'failed') return { state, events: [] }
    return { state: initialStage(state.stageIndex, { totalStars: state.totalStars, score: state.score, bestCombo: state.bestCombo }), events: [] }
  }
  if (action.type === 'next-stage') {
    if (state.status !== 'stage-won') return { state, events: [] }
    return { state: initialStage(state.stageIndex + 1, { totalStars: state.totalStars, score: state.score, bestCombo: state.bestCombo }), events: [] }
  }
  if (state.status !== 'playing') return { state, events: [] }
  if (action.type === 'set-signal') {
    if (state.signal === action.signal) return { state, events: [] }
    return { state: { ...state, signal: action.signal }, events: [{ type: 'signal-changed', signal: action.signal }] }
  }

  const stage = ANIMAL_CROSSING_STAGES[state.stageIndex]
  const events: AnimalCrossingEvent[] = []
  const cars = [...state.cars]
  let spawnCursor = state.spawnCursor
  let nextCarId = state.nextCarId
  const spawn = stage.spawns[spawnCursor]
  if (spawn === null) {
    spawnCursor += 1
  } else if (spawn && !cars.some(car => car.route === spawn && car.position === -2)) {
    cars.push({ id: nextCarId, route: spawn, position: -2 })
    nextCarId += 1
    spawnCursor += 1
    events.push({ type: 'car-spawned', route: spawn })
  }

  const moved = cars.map(car => car.route === state.signal ? { ...car, position: car.position + 1 } : car)
  const horizontalCenter = moved.some(car => car.route === 'horizontal' && car.position === 0)
  const verticalCenter = moved.some(car => car.route === 'vertical' && car.position === 0)
  const collision = horizontalCenter && verticalCenter
  const collidedIds = collision ? new Set(moved.filter(car => car.position === 0).map(car => car.id)) : new Set<number>()
  if (collision) events.push({ type: 'collision' })

  const deliveredNow = moved.filter(car => !collidedIds.has(car.id) && car.position >= 2).length
  if (deliveredNow > 0) events.push({ type: 'car-delivered', count: deliveredNow })
  const remaining = moved.filter(car => !collidedIds.has(car.id) && car.position < 2)
  const hearts = state.hearts - (collision ? 1 : 0)
  const combo = collision ? 0 : state.combo + deliveredNow
  const delivered = state.delivered + deliveredNow
  const ticks = state.ticks + 1
  const score = state.score + deliveredNow * 100 * Math.max(1, combo)
  const bestCombo = Math.max(state.bestCombo, combo)

  if (hearts <= 0 || ticks >= stage.tickLimit) {
    return {
      state: { ...state, status: 'failed', cars: remaining, spawnCursor, nextCarId, ticks, hearts, delivered, combo, bestCombo, score },
      events: [...events, { type: 'stage-lost' }],
    }
  }

  if (spawnCursor >= stage.spawns.length && remaining.length === 0) {
    const stars = hearts
    const finished = state.stageIndex === ANIMAL_CROSSING_STAGES.length - 1
    return {
      state: {
        ...state,
        status: finished ? 'finished' : 'stage-won',
        cars: remaining,
        spawnCursor,
        nextCarId,
        ticks,
        hearts,
        delivered,
        combo,
        bestCombo,
        stageStars: stars,
        totalStars: state.totalStars + stars,
        score: score + stars * 100,
      },
      events: [...events, { type: 'stage-won' }, ...(finished ? [{ type: 'game-finished' } as const] : [])],
    }
  }

  return { state: { ...state, cars: remaining, spawnCursor, nextCarId, ticks, hearts, delivered, combo, bestCombo, score }, events }
}

export function calculateAnimalCrossingResult(state: AnimalCrossingState) {
  if (state.status !== 'finished') throw new Error('ゲーム終了前です')
  return { score: state.score, stars: state.totalStars, bestCombo: state.bestCombo, isCleared: true }
}
