import { describe, expect, it } from 'vitest'
import { createNumberOrderQuestions } from './numberOrderQuestion'

describe('createNumberOrderQuestions', () => {
  it('creates a sequence with one missing number and choices', () => {
    const questions = createNumberOrderQuestions(() => 0)
    const question = questions[0]

    expect(questions.length).toBeGreaterThanOrEqual(5)
    expect(question).toMatchObject({ id: 'number-order-1-5', sequence: [1, 2, null, 4, 5], answer: 3 })
    expect(question?.choices.map((choice) => choice.value)).toContain(3)
    expect(question?.choices).toHaveLength(4)
  })
})
