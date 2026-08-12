import { describe, expect, it } from 'vitest'
import type { StrokeDefinition } from './types'
import { loadStrokeQuestions } from './loader'
import {
  createStrokeRegion,
  recognizeStrokeRegion,
} from './strokeRegionRecognizer'

const stroke: StrokeDefinition = {
  order: 1,
  guidePath: 'M 20 50 L 50 50 L 80 50',
  checkpoints: [
    { x: 20, y: 50 },
    { x: 50, y: 50 },
    { x: 80, y: 50 },
  ],
}

const outlinePath = 'M 10 40 L 90 40 L 90 60 L 10 60 Z'

describe('recognizeStrokeRegion', () => {
  it('accepts a trace through the visible stroke region', () => {
    const region = createStrokeRegion(stroke, outlinePath)

    expect(
      recognizeStrokeRegion(
        [
          { x: 20, y: 50 },
          { x: 50, y: 50 },
          { x: 80, y: 50 },
        ],
        region,
      ),
    ).toMatchObject({ accepted: true, reason: 'accepted', progress: 1 })
  })

  it('accepts a trace slightly outside the visible region', () => {
    const region = createStrokeRegion(stroke, outlinePath)

    expect(
      recognizeStrokeRegion(
        [
          { x: 20, y: 66 },
          { x: 50, y: 66 },
          { x: 80, y: 66 },
        ],
        region,
      ),
    ).toMatchObject({ accepted: true, reason: 'accepted' })
  })

  it('rejects a trace that stays well outside the visible region', () => {
    const region = createStrokeRegion(stroke, outlinePath)

    expect(
      recognizeStrokeRegion(
        [
          { x: 20, y: 75 },
          { x: 50, y: 75 },
          { x: 80, y: 75 },
        ],
        region,
      ),
    ).toMatchObject({ accepted: false, reason: 'off-path' })
  })

  it('rejects a tap without enough movement', () => {
    const region = createStrokeRegion(stroke, outlinePath)

    expect(recognizeStrokeRegion([{ x: 20, y: 50 }], region)).toMatchObject({
      accepted: false,
      reason: 'incomplete',
    })
  })

  it('rejects a trace that starts away from the stroke start', () => {
    const region = createStrokeRegion(stroke, outlinePath)

    expect(
      recognizeStrokeRegion(
        [
          { x: 80, y: 50 },
          { x: 50, y: 50 },
          { x: 20, y: 50 },
        ],
        region,
      ),
    ).toMatchObject({ accepted: false, reason: 'start-too-far' })
  })

  it('rejects a trace that stops before the end of the stroke', () => {
    const region = createStrokeRegion(stroke, outlinePath)

    expect(
      recognizeStrokeRegion(
        [
          { x: 20, y: 50 },
          { x: 50, y: 50 },
        ],
        region,
      ),
    ).toMatchObject({ accepted: false, reason: 'incomplete' })
  })

  it('uses the same curved outline that is shown to the learner', () => {
    const curvedStroke: StrokeDefinition = {
      ...stroke,
      checkpoints: [
        { x: 20, y: 50 },
        { x: 50, y: 30 },
        { x: 80, y: 50 },
      ],
    }
    const region = createStrokeRegion(
      curvedStroke,
      'M 10 50 C 30 10 70 10 90 50 L 90 70 C 70 30 30 30 10 70 Z',
    )

    expect(
      recognizeStrokeRegion(
        [
          { x: 20, y: 48 },
          { x: 50, y: 30 },
          { x: 80, y: 48 },
        ],
        region,
      ).accepted,
    ).toBe(true)
  })

  it('recognizes every generated kana stroke from its own outline', () => {
    for (const question of loadStrokeQuestions()) {
      question.strokes.forEach((stroke, index) => {
        const region = createStrokeRegion(stroke, question.glyphPaths[index])

        const recognition = recognizeStrokeRegion(stroke.checkpoints, region)
        expect(recognition, `${question.kana} ${index + 1}画目 ${JSON.stringify(recognition)}`)
          .toMatchObject({ accepted: true, progress: 1 })
      })
    }
  })
})
