import { describe, expect, it } from 'vitest'
import type { GameDifficulty } from '../../../shared/gameDifficulty'
import { createArithmeticQuestions } from './arithmeticQuestion'

describe('createArithmeticQuestions', () => {
  it.each([
    ['addition', (left: number, right: number) => left + right],
    ['subtraction', (left: number, right: number) => left - right],
  ] as const)('creates valid %s questions for every difficulty', (kind, calculate) => {
    const limits: Record<GameDifficulty, number> = { easy: 5, normal: 10, hard: 20 }

    for (const difficulty of Object.keys(limits) as GameDifficulty[]) {
      const questions = createArithmeticQuestions(kind, difficulty, () => 0.999)

      expect(questions.length).toBeGreaterThanOrEqual(7)
      for (const question of questions) {
        expect(question.kind).toBe(kind)
        expect(question.answer).toBe(calculate(question.left, question.right))
        expect(question.answer).toBeGreaterThanOrEqual(0)
        expect(question.answer).toBeLessThanOrEqual(limits[difficulty])
        expect(question.choices).toHaveLength(4)
        expect(new Set(question.choices.map((choice) => choice.value)).size).toBe(4)
        expect(question.choices.find((choice) => choice.id === question.correctChoiceId)?.value).toBe(question.answer)
      }
    }
  })
})
