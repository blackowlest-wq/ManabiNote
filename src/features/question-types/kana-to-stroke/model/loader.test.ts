import { describe, expect, it } from 'vitest'
import { loadStrokeQuestions } from './loader'

describe('loadStrokeQuestions', () => {
  it('loads the five kana in fixed practice order', () => {
    const questions = loadStrokeQuestions()

    expect(questions).toHaveLength(5)
    expect(questions.map((question) => question.kana)).toEqual(['あ', 'い', 'う', 'え', 'お'])
  })

  it('loads visible and judgeable data for every stroke', () => {
    const questions = loadStrokeQuestions()

    expect(questions.flatMap((question) => question.strokes)).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          guidePath: expect.any(String),
          checkpoints: expect.arrayContaining([expect.objectContaining({ x: expect.any(Number), y: expect.any(Number) })]),
        }),
      ]),
    )
    expect(questions.flatMap((question) => question.strokes).every((stroke) => stroke.checkpoints.length >= 2)).toBe(true)
  })
})
