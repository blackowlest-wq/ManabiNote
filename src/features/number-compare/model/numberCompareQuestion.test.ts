import { describe, expect, it } from 'vitest'
import { createNumberCompareQuestions } from './numberCompareQuestion'

describe('createNumberCompareQuestions', () => {
  it('creates pairs with one correct larger-number choice', () => {
    const questions = createNumberCompareQuestions(() => 0)
    const question = questions[0]

    expect(questions.length).toBeGreaterThanOrEqual(5)
    expect(question).toMatchObject({ id: 'number-compare-1-3', left: 1, right: 3 })
    expect(question?.choices.map((choice) => choice.value)).toEqual([3, 1])
    expect(question?.choices.find((choice) => choice.id === question.correctChoiceId)?.value).toBe(3)
  })
})
