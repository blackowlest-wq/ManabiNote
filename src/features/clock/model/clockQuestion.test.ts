import { describe, expect, it } from 'vitest'
import type { GameDifficulty } from '../../../shared/gameDifficulty'
import { createClockQuestions, formatClockTime, getClockHandPoints } from './clockQuestion'

describe('createClockQuestions', () => {
  it.each([
    ['easy', [0]],
    ['normal', [0, 30]],
    ['hard', [10, 15, 20, 25, 35, 40, 45, 50]],
  ] as const)('creates valid %s clock questions', (difficulty, expectedMinutes) => {
    const questions = createClockQuestions(difficulty as GameDifficulty, () => 0.999)

    expect(questions.length).toBeGreaterThanOrEqual(7)
    for (const question of questions) {
      expect(expectedMinutes).toContain(question.minute)
      expect(question.choices).toHaveLength(4)
      expect(question.choices.find((choice) => choice.id === question.correctChoiceId)?.label).toBe(
        formatClockTime(question),
      )
    }
  })

  it('calculates hour and minute hand positions', () => {
    expect(getClockHandPoints(3, 0)).toEqual({ hour: { x: 158, y: 100 }, minute: { x: 100, y: 24 } })
  })
})
