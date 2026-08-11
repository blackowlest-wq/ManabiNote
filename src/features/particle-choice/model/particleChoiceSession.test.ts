import { describe, expect, it } from 'vitest'
import { createParticleChoiceQuestions } from './particleChoiceQuestion'
import { createParticleChoiceSession, nextParticleChoiceQuestion, selectParticleChoice } from './particleChoiceSession'

const questions = createParticleChoiceQuestions(() => 0.999)

describe('particle choice session', () => {
  it('marks the matching particle as correct', () => {
    const session = createParticleChoiceSession(questions, () => new Date('2026-08-11T10:00:00.000Z'), () => 0.999)
    const question = session.questions[0]
    if (!question) throw new Error('問題がありません')

    expect(selectParticleChoice(session, question.correctChoiceId).feedback).toBe('correct')
  })

  it('moves to the next question after a correct answer', () => {
    const session = createParticleChoiceSession(questions, () => new Date('2026-08-11T10:00:00.000Z'), () => 0.999)
    const question = session.questions[0]
    if (!question) throw new Error('問題がありません')

    const next = nextParticleChoiceQuestion(selectParticleChoice(session, question.correctChoiceId))

    expect(next.currentIndex).toBe(1)
    expect(next.feedback).toBe('none')
  })
})
