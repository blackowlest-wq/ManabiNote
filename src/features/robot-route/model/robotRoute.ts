export type RobotCommand = 'up' | 'right' | 'down' | 'left'
export type RobotFailureReason = 'wall' | 'missing-battery' | 'not-at-goal'

export type RobotStage = {
  id: string
  name: string
  width: number
  height: number
  startIndex: number
  goalIndex: number
  wallIndexes: readonly number[]
  batteryIndexes: readonly number[]
  par: number
  solution: readonly RobotCommand[]
}

export type RobotRouteState = {
  status: 'planning' | 'failed' | 'cleared'
  position: number
  commands: readonly RobotCommand[]
  collectedBatteryIndexes: readonly number[]
  trace: readonly number[]
  attemptCount: number
  failureReason: RobotFailureReason | null
}

export type RobotRouteAction =
  | { type: 'add-command'; command: RobotCommand }
  | { type: 'remove-last-command' }
  | { type: 'clear-commands' }
  | { type: 'run' }
  | { type: 'retry' }

export type RobotRouteEvent =
  | { type: 'command-added'; command: RobotCommand }
  | { type: 'command-limit-reached' }
  | { type: 'battery-collected'; index: number }
  | { type: 'robot-bumped' }
  | { type: 'robot-stopped'; reason: RobotFailureReason }
  | { type: 'robot-arrived' }

export type RobotRouteTransition = {
  state: RobotRouteState
  events: readonly RobotRouteEvent[]
}

export const ROBOT_STAGES: readonly RobotStage[] = [
  {
    id: 'first-drive',
    name: 'はじめての しゅっぱつ',
    width: 4,
    height: 3,
    startIndex: 4,
    goalIndex: 6,
    wallIndexes: [],
    batteryIndexes: [],
    par: 2,
    solution: ['right', 'right'],
  },
  {
    id: 'around-the-wall',
    name: 'かべを よけよう',
    width: 4,
    height: 3,
    startIndex: 0,
    goalIndex: 11,
    wallIndexes: [1, 5, 6],
    batteryIndexes: [],
    par: 5,
    solution: ['down', 'down', 'right', 'right', 'right'],
  },
  {
    id: 'first-battery',
    name: 'でんちを ひろおう',
    width: 4,
    height: 3,
    startIndex: 0,
    goalIndex: 11,
    wallIndexes: [1, 2, 7, 9],
    batteryIndexes: [5],
    par: 5,
    solution: ['down', 'right', 'right', 'down', 'right'],
  },
  {
    id: 'battery-detour',
    name: 'もどって すすもう',
    width: 4,
    height: 4,
    startIndex: 0,
    goalIndex: 15,
    wallIndexes: [1, 5, 9],
    batteryIndexes: [6],
    par: 10,
    solution: ['down', 'down', 'down', 'right', 'right', 'up', 'up', 'down', 'down', 'right'],
  },
  {
    id: 'two-batteries',
    name: 'ふたつの でんち',
    width: 5,
    height: 4,
    startIndex: 0,
    goalIndex: 19,
    wallIndexes: [1, 6, 11, 13],
    batteryIndexes: [7, 17],
    par: 11,
    solution: ['down', 'down', 'down', 'right', 'right', 'up', 'up', 'right', 'right', 'down', 'down'],
  },
  {
    id: 'robot-master',
    name: 'ロボット マスター',
    width: 5,
    height: 5,
    startIndex: 20,
    goalIndex: 4,
    wallIndexes: [2, 9, 10, 14, 17, 19, 21],
    batteryIndexes: [6, 12, 18],
    par: 15,
    solution: ['up', 'right', 'up', 'right', 'up', 'left', 'right', 'right', 'down', 'down', 'up', 'up', 'up', 'right'],
  },
  {
    id: 'edge-patrol',
    name: 'はしっこ パトロール',
    width: 5,
    height: 5,
    startIndex: 0,
    goalIndex: 24,
    wallIndexes: [1, 6, 11, 16],
    batteryIndexes: [10, 22],
    par: 8,
    solution: ['down', 'down', 'down', 'down', 'right', 'right', 'right', 'right'],
  },
  {
    id: 'stairway-batteries',
    name: 'かいだん でんち',
    width: 5,
    height: 5,
    startIndex: 20,
    goalIndex: 4,
    wallIndexes: [6, 8, 13, 16, 17, 18],
    batteryIndexes: [11, 7, 3],
    par: 8,
    solution: ['up', 'up', 'right', 'right', 'up', 'up', 'right', 'right'],
  },
  {
    id: 'battery-loop',
    name: 'ぐるっと でんち',
    width: 5,
    height: 5,
    startIndex: 0,
    goalIndex: 20,
    wallIndexes: [1, 2, 8, 13, 16],
    batteryIndexes: [7, 10],
    par: 8,
    solution: ['down', 'right', 'right', 'down', 'left', 'left', 'down', 'down'],
  },
  {
    id: 'three-corners',
    name: 'みっつの かど',
    width: 5,
    height: 5,
    startIndex: 4,
    goalIndex: 20,
    wallIndexes: [8, 9, 10, 11, 21, 22, 23, 24],
    batteryIndexes: [2, 14, 16],
    par: 12,
    solution: ['left', 'left', 'down', 'down', 'right', 'right', 'down', 'left', 'left', 'left', 'left', 'down'],
  },
  {
    id: 'zigzag-lab',
    name: 'ジグザグ けんきゅうじょ',
    width: 5,
    height: 5,
    startIndex: 22,
    goalIndex: 2,
    wallIndexes: [1, 3, 8, 9, 13, 14, 18, 19],
    batteryIndexes: [20, 17, 5],
    par: 13,
    solution: ['left', 'left', 'up', 'right', 'right', 'up', 'left', 'left', 'up', 'right', 'right', 'up'],
  },
  {
    id: 'robot-champion',
    name: 'ロボット チャンピオン',
    width: 5,
    height: 5,
    startIndex: 0,
    goalIndex: 24,
    wallIndexes: [4, 5, 6, 7, 9, 10, 14, 15, 17, 18, 19, 20],
    batteryIndexes: [3, 11, 21],
    par: 12,
    solution: ['right', 'right', 'right', 'down', 'down', 'left', 'left', 'down', 'down', 'right', 'right', 'right'],
  },
]

export function startRobotStage(stage: RobotStage): RobotRouteState {
  return {
    status: 'planning',
    position: stage.startIndex,
    commands: [],
    collectedBatteryIndexes: [],
    trace: [stage.startIndex],
    attemptCount: 0,
    failureReason: null,
  }
}

const nextIndexFor = (stage: RobotStage, index: number, command: RobotCommand) => {
  const row = Math.floor(index / stage.width)
  const column = index % stage.width
  if (command === 'up') return row > 0 ? index - stage.width : null
  if (command === 'right') return column < stage.width - 1 ? index + 1 : null
  if (command === 'down') return row < stage.height - 1 ? index + stage.width : null
  return column > 0 ? index - 1 : null
}

const runProgram = (stage: RobotStage, state: RobotRouteState): RobotRouteTransition => {
  let position = stage.startIndex
  const trace = [position]
  const batteries = new Set<number>()
  const events: RobotRouteEvent[] = []
  for (const command of state.commands) {
    const nextIndex = nextIndexFor(stage, position, command)
    if (nextIndex === null || stage.wallIndexes.includes(nextIndex)) {
      events.push({ type: 'robot-bumped' }, { type: 'robot-stopped', reason: 'wall' })
      return {
        state: {
          ...state,
          status: 'failed',
          position,
          trace,
          collectedBatteryIndexes: [...batteries],
          attemptCount: state.attemptCount + 1,
          failureReason: 'wall',
        },
        events,
      }
    }
    position = nextIndex
    trace.push(position)
    if (stage.batteryIndexes.includes(position) && !batteries.has(position)) {
      batteries.add(position)
      events.push({ type: 'battery-collected', index: position })
    }
  }

  const allBatteries = stage.batteryIndexes.every((index) => batteries.has(index))
  if (position === stage.goalIndex && allBatteries) {
    events.push({ type: 'robot-arrived' })
    return {
      state: {
        ...state,
        status: 'cleared',
        position,
        trace,
        collectedBatteryIndexes: [...batteries],
        attemptCount: state.attemptCount + 1,
        failureReason: null,
      },
      events,
    }
  }

  const reason: RobotFailureReason = position === stage.goalIndex ? 'missing-battery' : 'not-at-goal'
  events.push({ type: 'robot-stopped', reason })
  return {
    state: {
      ...state,
      status: 'failed',
      position,
      trace,
      collectedBatteryIndexes: [...batteries],
      attemptCount: state.attemptCount + 1,
      failureReason: reason,
    },
    events,
  }
}

export function applyRobotAction(
  stage: RobotStage,
  state: RobotRouteState,
  action: RobotRouteAction,
): RobotRouteTransition {
  if (action.type === 'retry') {
    if (state.status !== 'failed') return { state, events: [] }
    return {
      state: {
        ...state,
        status: 'planning',
        position: stage.startIndex,
        commands: [],
        collectedBatteryIndexes: [],
        trace: [stage.startIndex],
        failureReason: null,
      },
      events: [],
    }
  }
  if (state.status !== 'planning') return { state, events: [] }
  if (action.type === 'add-command') {
    if (state.commands.length >= stage.solution.length + 4) {
      return { state, events: [{ type: 'command-limit-reached' }] }
    }
    return {
      state: { ...state, commands: [...state.commands, action.command] },
      events: [{ type: 'command-added', command: action.command }],
    }
  }
  if (action.type === 'remove-last-command') {
    return { state: { ...state, commands: state.commands.slice(0, -1) }, events: [] }
  }
  if (action.type === 'clear-commands') {
    return { state: { ...state, commands: [] }, events: [] }
  }
  if (state.commands.length === 0) return { state, events: [] }
  return runProgram(stage, state)
}

export function calculateRobotStars(stage: RobotStage, state: RobotRouteState) {
  if (state.status !== 'cleared') throw new Error('ステージクリア前は星を計算できません')
  if (state.commands.length <= stage.par && state.attemptCount <= 1) return 3
  if (state.commands.length <= stage.par + 3 && state.attemptCount <= 2) return 2
  return 1
}
