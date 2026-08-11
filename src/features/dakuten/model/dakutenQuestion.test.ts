import { describe, expect, it } from 'vitest'
import { createDakutenQuestions } from './dakutenQuestion'

describe('dakuten question model', () => {
  it('creates twenty-five voiced and semi-voiced sound questions', () => {
    const questions = createDakutenQuestions(() => 0.999)

    expect(questions).toHaveLength(25)
    expect(new Set(questions.map((question) => question.id)).size).toBe(25)
    expect(questions[0]).toMatchObject({ baseCharacter: 'か', mark: '゛', answer: 'が' })
    expect(questions[20]).toMatchObject({ baseCharacter: 'は', mark: '゜', answer: 'ぱ' })
    expect(questions.every((question) => question.choices.length === 4)).toBe(true)
    expect(questions.every((question) => question.choices.some((choice) => choice.id === question.correctChoiceId && choice.character === question.answer))).toBe(true)
  })
})
