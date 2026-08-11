import { describe, expect, it } from 'vitest'
import { createShapePatternQuestions, getShapePatternLabel } from './shapePatternQuestion'

describe('createShapePatternQuestions', () => {
  it('creates visual sequences with four text-answer choices', () => {
    const questions = createShapePatternQuestions(() => 0.999)

    expect(questions.length).toBeGreaterThanOrEqual(7)
    for (const question of questions) {
      expect(question.sequence).toHaveLength(4)
      expect(question.choices).toHaveLength(4)
      expect(new Set(question.choices.map(getShapePatternLabel)).size).toBe(4)
      expect(getShapePatternLabel(question.choices.find((choice) => choice.id === question.correctChoiceId)!)).toBe(
        getShapePatternLabel(question.answer),
      )
    }
  })
})
