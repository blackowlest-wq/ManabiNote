import { describe, expect, it } from 'vitest'
import { FIRST_GRADE_KANJI } from './kanjiCharacters'
import { StrokeDataError, validateKanjiStrokeQuestions } from './validator'

const makeStroke = (order: number) => ({
  order,
  guidePath: 'M 20 20 L 60 60',
  checkpoints: [
    { x: 20, y: 20 },
    { x: 60, y: 60 },
  ],
})

const makeQuestion = (kanji: string, id = 'kanji-' + kanji) => ({
  type: 'kanji-to-stroke',
  id,
  kanji,
  viewBox: '0 0 200 200',
  glyphPaths: ['M 20 20 L 60 20 Z'],
  strokes: [makeStroke(1)],
})

const makeQuestions = () => FIRST_GRADE_KANJI.map((kanji) => makeQuestion(kanji))

describe('validateKanjiStrokeQuestions', () => {
  it('returns typed data for the fixed 80-character set', () => {
    const result = validateKanjiStrokeQuestions(makeQuestions())

    expect(result).toHaveLength(80)
    expect(result.map((question) => question.kanji)).toEqual(FIRST_GRADE_KANJI)
  })

  it('rejects a question set that is not exactly the target kanji set', () => {
    const questions = makeQuestions()
    questions[79].kanji = '一'

    expect(() => validateKanjiStrokeQuestions(questions)).toThrow(StrokeDataError)
  })

  it('rejects a question without one glyph path per stroke', () => {
    const questions = makeQuestions()
    questions[0].glyphPaths = []

    expect(() => validateKanjiStrokeQuestions(questions)).toThrow(StrokeDataError)
  })
})
