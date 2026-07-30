import { describe, expect, it } from 'vitest'
import { StrokeDataError, validateStrokeQuestions } from './validator'

const makeStroke = () => ({
  order: 1,
  guidePath: 'M 20 20 L 60 60',
  checkpoints: [
    { x: 20, y: 20 },
    { x: 60, y: 60 },
  ],
})

const makeQuestion = (kana: string, id = 'hiragana-' + kana) => ({
  type: 'kana-to-stroke',
  id,
  kana,
  viewBox: '0 0 200 200',
  strokes: [makeStroke()],
})

const makeQuestions = () => ['あ', 'い', 'う', 'え', 'お'].map((kana) => makeQuestion(kana))

describe('validateStrokeQuestions', () => {
  it('returns typed data for the fixed five-character set', () => {
    const result = validateStrokeQuestions(makeQuestions())

    expect(result).toHaveLength(5)
    expect(result.map((question) => question.kana)).toEqual(['あ', 'い', 'う', 'え', 'お'])
    expect(result[0].strokes[0].checkpoints).toHaveLength(2)
  })

  it('rejects non-array input', () => {
    expect(() => validateStrokeQuestions('broken')).toThrow(StrokeDataError)
  })

  it('rejects an unsupported question type', () => {
    const questions = makeQuestions()
    questions[0].type = 'kana-to-picture'

    expect(() => validateStrokeQuestions(questions)).toThrow(StrokeDataError)
  })

  it('rejects duplicate question ids', () => {
    const questions = makeQuestions()
    questions[1].id = questions[0].id

    expect(() => validateStrokeQuestions(questions)).toThrow(StrokeDataError)
  })

  it('rejects a question set that is not exactly the target kana set', () => {
    const questions = makeQuestions()
    questions[4].kana = 'か'

    expect(() => validateStrokeQuestions(questions)).toThrow(StrokeDataError)
  })

  it('rejects a question with no strokes', () => {
    const questions = makeQuestions()
    questions[0].strokes = []

    expect(() => validateStrokeQuestions(questions)).toThrow(StrokeDataError)
  })

  it('rejects non-contiguous stroke orders', () => {
    const questions = makeQuestions()
    questions[0].strokes[0].order = 2

    expect(() => validateStrokeQuestions(questions)).toThrow(StrokeDataError)
  })

  it('rejects an empty guide path', () => {
    const questions = makeQuestions()
    questions[0].strokes[0].guidePath = ' '

    expect(() => validateStrokeQuestions(questions)).toThrow(StrokeDataError)
  })

  it('rejects a stroke with fewer than two checkpoints', () => {
    const questions = makeQuestions()
    questions[0].strokes[0].checkpoints = [{ x: 20, y: 20 }]

    expect(() => validateStrokeQuestions(questions)).toThrow(StrokeDataError)
  })

  it('rejects checkpoints outside the SVG viewBox', () => {
    const questions = makeQuestions()
    questions[0].strokes[0].checkpoints[1] = { x: 201, y: 60 }

    expect(() => validateStrokeQuestions(questions)).toThrow(StrokeDataError)
  })
})
