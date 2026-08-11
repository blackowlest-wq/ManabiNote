import { describe, expect, it } from 'vitest'
import { applyRobotAction, calculateRobotStars, ROBOT_STAGES, startRobotStage } from './robotRoute'

describe('robotRoute', () => {
  it('runs a queued route and lands the robot on the goal', () => {
    const stage = ROBOT_STAGES[0]
    let state = startRobotStage(stage)

    state = applyRobotAction(stage, state, { type: 'add-command', command: 'right' }).state
    state = applyRobotAction(stage, state, { type: 'add-command', command: 'right' }).state
    const launched = applyRobotAction(stage, state, { type: 'run' })

    expect(launched.state.status).toBe('cleared')
    expect(launched.state.position).toBe(stage.goalIndex)
    expect(launched.state.trace).toEqual([4, 5, 6])
    expect(launched.events).toContainEqual({ type: 'robot-arrived' })
    expect(calculateRobotStars(stage, launched.state)).toBe(3)
  })

  it('ships six routes that collect every battery before the goal', () => {
    expect(ROBOT_STAGES).toHaveLength(6)
    for (const stage of ROBOT_STAGES) {
      let state = startRobotStage(stage)
      for (const command of stage.solution) {
        state = applyRobotAction(stage, state, { type: 'add-command', command }).state
      }
      state = applyRobotAction(stage, state, { type: 'run' }).state

      expect(state.status, stage.id).toBe('cleared')
      expect(state.collectedBatteryIndexes.sort(), stage.id).toEqual([...stage.batteryIndexes].sort())
    }
  })
})
