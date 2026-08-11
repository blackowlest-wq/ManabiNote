import { describe, expect, it } from 'vitest'
import {
  applyCopyBeatAction,
  COPY_BEAT_CLEAR_ROUND,
  startCopyBeat,
  type CopyBeatState,
} from './copyBeat'

const alwaysFirst = () => 0
const alwaysLast = () => 0.99

describe('copyBeat', () => {
  it('starts with one deterministic beat to watch', () => {
    const state = startCopyBeat(alwaysFirst)

    expect(state.status).toBe('showing')
    expect(state.sequence).toEqual(['sun'])
    expect(state.round).toBe(1)
  })

  it('rewards copying the whole sequence in order', () => {
    const showing = startCopyBeat(alwaysFirst)
    const input = applyCopyBeatAction(showing, { type: 'finish-showing' }).state

    const copied = applyCopyBeatAction(input, { type: 'tap-pad', pad: 'sun' })

    expect(copied.state.status).toBe('round-won')
    expect(copied.state.score).toBe(100)
    expect(copied.state.combo).toBe(1)
    expect(copied.events).toContainEqual({ type: 'round-copied', round: 1 })
  })

  it('adds one beat for the next round', () => {
    const state: CopyBeatState = {
      ...startCopyBeat(alwaysFirst),
      status: 'round-won',
      sequence: ['sun'],
    }

    const next = applyCopyBeatAction(state, { type: 'next-round' }, alwaysLast)

    expect(next.state.sequence).toEqual(['sun', 'leaf'])
    expect(next.state.round).toBe(2)
    expect(next.state.status).toBe('showing')
  })

  it('uses one heart and replays the pattern after a different tap', () => {
    const state: CopyBeatState = {
      ...startCopyBeat(alwaysFirst),
      status: 'input',
      sequence: ['sun'],
    }

    const missed = applyCopyBeatAction(state, { type: 'tap-pad', pad: 'moon' })

    expect(missed.state.hearts).toBe(2)
    expect(missed.state.status).toBe('showing')
    expect(missed.state.combo).toBe(0)
    expect(missed.events).toContainEqual({ type: 'pattern-replay' })
  })

  it('finishes after copying the sixth pattern', () => {
    const state: CopyBeatState = {
      ...startCopyBeat(alwaysFirst),
      status: 'input',
      round: COPY_BEAT_CLEAR_ROUND,
      sequence: ['sun'],
    }

    const finished = applyCopyBeatAction(state, { type: 'tap-pad', pad: 'sun' })

    expect(finished.state.status).toBe('finished')
    expect(finished.events.some((event) => event.type === 'game-finished')).toBe(true)
  })
})
