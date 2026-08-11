import { describe, expect, it } from 'vitest'
import {
  applyHelperTeamAction,
  HELPER_TEAM_STAGES,
  startHelperTeam,
} from './helperTeam'

describe('helperTeam', () => {
  it('builds an ordered team without using the same helper twice', () => {
    let state = startHelperTeam(0)
    state = applyHelperTeamAction(state, { type: 'add-helper', helper: 'beaver' }).state

    const duplicate = applyHelperTeamAction(state, { type: 'add-helper', helper: 'beaver' })

    expect(state.plan).toEqual(['beaver'])
    expect(duplicate.state).toBe(state)
  })

  it('crosses obstacles when each helper meets its matching obstacle in order', () => {
    let state = startHelperTeam(0)
    state = applyHelperTeamAction(state, { type: 'add-helper', helper: 'beaver' }).state

    const run = applyHelperTeamAction(state, { type: 'run-team' })

    expect(run.state.status).toBe('stage-won')
    expect(run.state.passedCount).toBe(1)
    expect(run.events.some((event) => event.type === 'stage-won')).toBe(true)
  })

  it('stops at the first obstacle that the planned helper cannot cross', () => {
    let state = startHelperTeam(1)
    state = applyHelperTeamAction(state, { type: 'add-helper', helper: 'elephant' }).state
    state = applyHelperTeamAction(state, { type: 'add-helper', helper: 'rabbit' }).state

    const run = applyHelperTeamAction(state, { type: 'run-team' })
    const retry = applyHelperTeamAction(run.state, { type: 'retry' })

    expect(run.state.status).toBe('failed')
    expect(run.state.passedCount).toBe(0)
    expect(run.events).toContainEqual({ type: 'helper-blocked', obstacleIndex: 0, helper: 'elephant' })
    expect(retry.state.status).toBe('planning')
    expect(retry.state.attempts).toBe(1)
  })

  it('keeps every expedition solvable with its planned team', () => {
    for (const [stageIndex, stage] of HELPER_TEAM_STAGES.entries()) {
      let state = startHelperTeam(stageIndex)
      for (const helper of stage.solution) state = applyHelperTeamAction(state, { type: 'add-helper', helper }).state
      state = applyHelperTeamAction(state, { type: 'run-team' }).state
      expect(state.status, stage.name).toBe(stageIndex === HELPER_TEAM_STAGES.length - 1 ? 'finished' : 'stage-won')
      expect(state.passedCount, stage.name).toBe(stage.obstacles.length)
    }
  })
})
