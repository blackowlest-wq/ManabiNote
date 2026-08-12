import { describe, expect, it } from 'vitest'
import { FIRST_GRADE_KANJI } from './kanjiCharacters'
import { loadKanjiStrokeQuestions } from './loader'

describe('loadKanjiStrokeQuestions', () => {
  it('loads all first-grade kanji in the fixed order', () => {
    const questions = loadKanjiStrokeQuestions()

    expect(questions).toHaveLength(80)
    expect(questions.map((question) => question.kanji)).toEqual(FIRST_GRADE_KANJI)
  })

  it('loads one visible glyph path and at least two checkpoints for every stroke', () => {
    const questions = loadKanjiStrokeQuestions()

    expect(questions.every((question) => question.glyphPaths.length === question.strokes.length)).toBe(true)
    expect(questions.flatMap((question) => question.strokes).every((stroke) => stroke.checkpoints.length >= 2)).toBe(true)
    expect(questions.flatMap((question) => question.glyphPaths).every((path) => path.length > 0)).toBe(true)
  })
})
