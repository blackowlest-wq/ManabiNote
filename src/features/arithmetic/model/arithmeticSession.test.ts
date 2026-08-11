import { describe, expect, it } from 'vitest'
import { createArithmeticQuestions } from './arithmeticQuestion'
import { createArithmeticSession, isArithmeticComplete, nextArithmeticQuestion, selectArithmeticChoice } from './arithmeticSession'

const questions = createArithmeticQuestions('addition', 'normal', () => 0.999)

describe('arithmetic session', () => {
  it('marks the selected answer as correct or incorrect', () => {
    const session = createArithmeticSession('addition', 'normal', questions, () => new Date('2026-08-11T10:00:00.000Z'), () => 0.999)
    const question = session.questions[0]
    if (!question) throw new Error('問題がありません')

    expect(selectArithmeticChoice(session, question.correctChoiceId).feedback).toBe('correct')
  })

  it('moves to the next question after a correct answer', () => {
    const session = createArithmeticSession('addition', 'normal', questions, () => new Date('2026-08-11T10:00:00.000Z'), () => 0.999)
    const question = session.questions[0]
    if (!question) throw new Error('問題がありません')

    const next = nextArithmeticQuestion(selectArithmeticChoice(session, question.correctChoiceId))

    expect(next.currentIndex).toBe(1)
    expect(next.difficulty).toBe('normal')
    expect(next.selectedChoiceId).toBeNull()
    expect(isArithmeticComplete(next)).toBe(false)
  })
})
