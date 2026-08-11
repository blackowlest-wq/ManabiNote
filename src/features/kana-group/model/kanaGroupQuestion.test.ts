import { describe, expect, it } from 'vitest'
import { createKanaGroupQuestions } from './kanaGroupQuestion'

describe('kana group question model', () => {
  it('creates a four-choice group question for every basic hiragana', () => {
    const questions = createKanaGroupQuestions(() => 0.999)

    expect(questions).toHaveLength(46)
    expect(questions[0]).toMatchObject({ targetCharacter: 'あ', groupId: 'a' })
    expect(questions.find((question) => question.targetCharacter === 'き')).toMatchObject({ groupId: 'ka' })
    expect(questions.find((question) => question.targetCharacter === 'を')).toMatchObject({ groupId: 'wa' })
    expect(questions.every((question) => question.choices.length === 4)).toBe(true)
    expect(questions.every((question) => question.choices.some((choice) => choice.id === question.correctChoiceId))).toBe(true)
  })
})
