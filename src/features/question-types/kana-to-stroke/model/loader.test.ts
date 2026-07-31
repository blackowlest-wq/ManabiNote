import { describe, expect, it } from 'vitest'
import { loadStrokeQuestions, loadStrokeQuestionsForRow } from './loader'
import { STROKE_KANA } from './kanaRows'

describe('loadStrokeQuestions', () => {
  it('loads all basic hiragana in fixed practice order', () => {
    const questions = loadStrokeQuestions()

    expect(questions).toHaveLength(46)
    expect(questions.map((question) => question.kana)).toEqual(STROKE_KANA)
  })

  it('loads only the selected row in row order', () => {
    expect(loadStrokeQuestionsForRow('sa').map((question) => question.kana)).toEqual(['さ', 'し', 'す', 'せ', 'そ'])
    expect(loadStrokeQuestionsForRow('n').map((question) => question.kana)).toEqual(['ん'])
  })

  it('preserves the current y coordinate when a guide uses a horizontal command', () => {
    const question = loadStrokeQuestions().find((candidate) => candidate.kana === 'す')

    expect(question?.strokes[1].checkpoints[8]).toEqual({ x: 94.9, y: 89.3 })
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

  it('keeps the recognizable glyph-shaped guide paths for the original five kana', () => {
    const expectedStrokeEnds: Record<string, readonly (readonly [number, number, number, number])[]> = {
      あ: [
        [34, 50.4, 136.1, 47.1],
        [64.6, 26.8, 84.2, 151.8],
        [111.3, 85.9, 99.2, 180.1],
      ],
      い: [
        [18.6, 48.6, 79.3, 122.7],
        [132.4, 53.3, 169.3, 124.8],
      ],
      う: [
        [78.1, 22.1, 127.7, 40],
        [41.6, 82.6, 96.1, 177.9],
      ],
      え: [
        [78.1, 22.1, 127.7, 40],
        [38.5, 85.2, 167, 166.6],
      ],
      お: [
        [21.8, 63.1, 104.5, 60.4],
        [56.1, 19.5, 114.8, 179.1],
        [138.7, 36.9, 169.5, 68.4],
      ],
    }

    for (const question of loadStrokeQuestions().filter((candidate) => candidate.kana in expectedStrokeEnds)) {
      question.strokes.forEach((stroke, index) => {
        const [startX, startY, endX, endY] = expectedStrokeEnds[question.kana][index]
        expect(stroke.checkpoints[0]).toEqual({ x: startX, y: startY })
        expect(stroke.checkpoints[stroke.checkpoints.length - 1]).toEqual({ x: endX, y: endY })
      })
    }
  })
})
