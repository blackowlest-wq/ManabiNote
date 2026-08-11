export type TowerBlock = { x: number; width: number }

export type AnimalTowerState = {
  status: 'playing' | 'finished' | 'lost'
  base: TowerBlock
  moving: TowerBlock
  landed: readonly TowerBlock[]
  direction: -1 | 1
  floor: number
  hearts: number
  combo: number
  score: number
}

export type AnimalTowerAction = { type: 'tick' } | { type: 'drop' }
export type AnimalTowerEvent =
  | { type: 'floor-landed'; overlap: number }
  | { type: 'floor-missed' }
  | { type: 'tower-finished' }
  | { type: 'game-lost' }

export type AnimalTowerTransition = { state: AnimalTowerState; events: readonly AnimalTowerEvent[] }
export type AnimalTowerResult = { score: number; floors: number; isCleared: boolean }

const FIELD_WIDTH = 10
export const TOWER_FLOOR_GOAL = 8

export function startAnimalTower(): AnimalTowerState {
  return {
    status: 'playing',
    base: { x: 2, width: 6 },
    moving: { x: 0, width: 6 },
    landed: [{ x: 2, width: 6 }],
    direction: 1,
    floor: 0,
    hearts: 3,
    combo: 0,
    score: 0,
  }
}

export function applyAnimalTowerAction(state: AnimalTowerState, action: AnimalTowerAction): AnimalTowerTransition {
  if (state.status !== 'playing') return { state, events: [] }
  if (action.type === 'tick') {
    const nextX = state.moving.x + state.direction
    if (nextX < 0 || nextX + state.moving.width > FIELD_WIDTH) {
      const direction = state.direction === 1 ? -1 : 1
      return { state: { ...state, direction, moving: { ...state.moving, x: state.moving.x + direction } }, events: [] }
    }
    return { state: { ...state, moving: { ...state.moving, x: nextX } }, events: [] }
  }

  const left = Math.max(state.base.x, state.moving.x)
  const right = Math.min(state.base.x + state.base.width, state.moving.x + state.moving.width)
  const overlap = right - left
  if (overlap <= 0) {
    const hearts = state.hearts - 1
    const lost = hearts === 0
    return {
      state: {
        ...state,
        status: lost ? 'lost' : 'playing',
        moving: { x: 0, width: state.base.width },
        direction: 1,
        hearts,
        combo: 0,
      },
      events: [{ type: 'floor-missed' }, ...(lost ? [{ type: 'game-lost' } as const] : [])],
    }
  }

  const base = { x: left, width: overlap }
  const floor = state.floor + 1
  const combo = state.combo + 1
  const finished = floor === TOWER_FLOOR_GOAL
  return {
    state: {
      ...state,
      status: finished ? 'finished' : 'playing',
      base,
      moving: { x: 0, width: overlap },
      landed: [...state.landed, base],
      direction: 1,
      floor,
      combo,
      score: state.score + overlap * 100 + combo * 50,
    },
    events: [{ type: 'floor-landed', overlap }, ...(finished ? [{ type: 'tower-finished' } as const] : [])],
  }
}

export function calculateAnimalTowerResult(state: AnimalTowerState): AnimalTowerResult {
  if (state.status !== 'finished' && state.status !== 'lost') throw new Error('ゲーム終了前は結果を計算できません')
  return { score: state.score, floors: state.floor, isCleared: state.status === 'finished' }
}
