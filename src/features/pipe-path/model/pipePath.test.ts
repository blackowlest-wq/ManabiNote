import { describe, expect, it } from 'vitest'
import { calculatePipeStars, isPipeStageSolved, PIPE_PATH_STAGES, rotatePipe, startPipeStage } from './pipePath'

describe('pipePath', () => {
  it('clears the first stage when one tap completes the water route', () => {
    const stage = PIPE_PATH_STAGES[0]
    const started = startPipeStage(stage)

    expect(started.status).toBe('playing')
    const transition = rotatePipe(stage, started, 4)

    expect(transition.state.status).toBe('cleared')
    expect(transition.state.turnCount).toBe(1)
    expect(transition.events).toEqual([{ type: 'water-reached-goals' }])
    expect(calculatePipeStars(stage, transition.state)).toBe(3)
  })

  it('ships six unsolved stages with a complete leak-free solution', () => {
    expect(PIPE_PATH_STAGES).toHaveLength(6)
    for (const stage of PIPE_PATH_STAGES) {
      const started = startPipeStage(stage)
      const solved = {
        ...started,
        rotations: stage.tiles.map((tile) => tile?.solutionRotation ?? 0),
      }

      expect(isPipeStageSolved(stage, started), `${stage.id} should begin unsolved`).toBe(false)
      expect(isPipeStageSolved(stage, solved), `${stage.id} should have a valid solution`).toBe(true)
    }
  })
})
