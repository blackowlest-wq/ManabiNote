import { describe, expect, it } from 'vitest'
import { createArithmeticQuestions } from './arithmeticQuestion'

describe('createArithmeticQuestions', () => {
  it.each([
    ['addition', (left: number, right: number) => left + right],
    ['subtraction', (left: number, right: number) => left - right],
  ] as const)('creates valid %s questions within ten', (kind, calculate) => {
    const questions = createArithmeticQuestions(kind, () => 0.999)

    expect(questions.length).toBeGreaterThanOrEqual(7)
    for (const question of questions) {
      expect(question.kind).toBe(kind)
      expect(question.answer).toBe(calculate(question.left, question.right))
      expect(question.answer).toBeGreaterThanOrEqual(0)
      expect(question.answer).toBeLessThanOrEqual(10)
      expect(question.choices).toHaveLength(4)
      expect(new Set(question.choices.map((choice) => choice.value)).size).toBe(4)
      expect(question.choices.find((choice) => choice.id === question.correctChoiceId)?.value).toBe(question.answer)
    }
  })
})
