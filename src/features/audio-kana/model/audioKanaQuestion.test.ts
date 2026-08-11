import { describe, expect, it } from 'vitest'
import { createAudioKanaQuestions } from './audioKanaQuestion'

describe('audio kana question model', () => {
  it('creates a four-choice audio question for every basic hiragana', () => {
    const questions = createAudioKanaQuestions(() => 0.999)

    expect(questions).toHaveLength(46)
    expect(questions[0]).toMatchObject({ answer: 'あ' })
    expect(questions.every((question) => question.choices.length === 4)).toBe(true)
    expect(questions.every((question) => question.choices.some((choice) => choice.id === question.correctChoiceId && choice.character === question.answer))).toBe(true)
  })
})
