import { describe, expect, it } from 'vitest'
import { createShapePatternQuestions } from './shapePatternQuestion'
import { createShapePatternSession, nextShapePatternQuestion, selectShapePatternChoice } from './shapePatternSession'

const questions = createShapePatternQuestions(() => 0.999)

describe('shape pattern session', () => {
  it('marks the next shape as correct', () => {
    const session = createShapePatternSession(questions, () => new Date('2026-08-11T10:00:00.000Z'), () => 0.999)
    const question = session.questions[0]
    if (!question) throw new Error('問題がありません')

    expect(selectShapePatternChoice(session, question.correctChoiceId).feedback).toBe('correct')
  })

  it('moves to the next pattern after a correct answer', () => {
    const session = createShapePatternSession(questions, () => new Date('2026-08-11T10:00:00.000Z'), () => 0.999)
    const question = session.questions[0]
    if (!question) throw new Error('問題がありません')

    const next = nextShapePatternQuestion(selectShapePatternChoice(session, question.correctChoiceId))

    expect(next.currentIndex).toBe(1)
    expect(next.feedback).toBe('none')
  })
})
