import { describe, expect, it } from 'vitest'
import { createClockQuestions } from './clockQuestion'
import { createClockSession, nextClockQuestion, selectClockChoice } from './clockSession'

const questions = createClockQuestions('normal', () => 0.999)

describe('clock session', () => {
  it('keeps the difficulty and advances after a correct answer', () => {
    const session = createClockSession('normal', questions, () => new Date('2026-08-11T10:00:00.000Z'), () => 0.999)
    const question = session.questions[0]
    if (!question) throw new Error('問題がありません')

    const correct = selectClockChoice(session, question.correctChoiceId)
    const next = nextClockQuestion(correct)

    expect(correct.feedback).toBe('correct')
    expect(next.currentIndex).toBe(1)
    expect(next.difficulty).toBe('normal')
  })
})
