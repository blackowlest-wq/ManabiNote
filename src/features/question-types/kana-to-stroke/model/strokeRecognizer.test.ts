import { describe, expect, it } from 'vitest'
import type { StrokeDefinition, StrokePoint } from './types'
import { recognizeStroke } from './strokeRecognizer'

const stroke: StrokeDefinition = {
  order: 1,
  guidePath: 'M 20 20 L 60 60 L 100 100',
  checkpoints: [
    { x: 20, y: 20 },
    { x: 60, y: 60 },
    { x: 100, y: 100 },
  ],
}

const points = (...values: StrokePoint[]): StrokePoint[] => values

describe('recognizeStroke', () => {
  it('accepts input that starts correctly and visits every checkpoint', () => {
    const result = recognizeStroke(points({ x: 20, y: 20 }, { x: 60, y: 60 }, { x: 100, y: 100 }), stroke)

    expect(result).toEqual({ accepted: true, reason: 'accepted', progress: 1 })
  })

  it('rejects input that starts too far from the first checkpoint', () => {
    const result = recognizeStroke(points({ x: 80, y: 20 }, { x: 100, y: 100 }), stroke)

    expect(result).toMatchObject({ accepted: false, reason: 'start-too-far' })
  })

  it('rejects an input point that leaves the guide polyline', () => {
    const result = recognizeStroke(points({ x: 20, y: 20 }, { x: 60, y: 20 }, { x: 100, y: 100 }), stroke)

    expect(result).toMatchObject({ accepted: false, reason: 'off-path' })
  })

  it('reports incomplete when the final checkpoint is not reached', () => {
    const result = recognizeStroke(points({ x: 20, y: 20 }, { x: 60, y: 60 }), stroke)

    expect(result).toEqual({ accepted: false, reason: 'incomplete', progress: 2 / 3 })
  })

  it('rejects input with fewer than the minimum number of points', () => {
    const result = recognizeStroke(points({ x: 20, y: 20 }), stroke)

    expect(result).toMatchObject({ accepted: false, reason: 'incomplete' })
  })

  it('allows the distance tolerances to be overridden', () => {
    const result = recognizeStroke(
      points({ x: 10, y: 20 }, { x: 60, y: 60 }, { x: 100, y: 100 }),
      stroke,
      { startTolerance: 5 },
    )

    expect(result).toMatchObject({ accepted: false, reason: 'start-too-far' })
  })
})
