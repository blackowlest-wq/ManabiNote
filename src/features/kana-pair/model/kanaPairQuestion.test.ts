import { describe, expect, it } from 'vitest'
import { createKanaPairQuestions, toKatakana } from './kanaPairQuestion'

describe('kana pair question model', () => {
  it('converts hiragana to the corresponding katakana', () => {
    expect(toKatakana('あ')).toBe('ア')
    expect(toKatakana('ん')).toBe('ン')
  })

  it('creates one four-choice question for each basic hiragana', () => {
    const questions = createKanaPairQuestions(() => 0.999)

    expect(questions).toHaveLength(46)
    expect(new Set(questions.map((question) => question.id)).size).toBe(46)
    expect(questions[0]).toMatchObject({ hiragana: 'あ', katakana: 'ア' })
    expect(questions.every((question) => question.choices.length === 4)).toBe(true)
    expect(questions.every((question) => question.choices.some((choice) => choice.id === question.correctChoiceId && choice.character === question.katakana))).toBe(true)
  })

  it('rejects a non-hiragana input', () => {
    expect(() => toKatakana('A')).toThrow()
  })
})
