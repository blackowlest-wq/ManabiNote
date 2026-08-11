import { describe, expect, it } from 'vitest'
import { createReadingComprehensionQuestions } from './readingComprehensionQuestion'
import {
  createReadingComprehensionSession,
  nextReadingComprehensionQuestion,
  selectReadingComprehensionChoice,
} from './readingComprehensionSession'

const questions = createReadingComprehensionQuestions('normal', () => 0.999)

describe('reading comprehension session', () => {
  it('marks the matching answer as correct', () => {
    const session = createReadingComprehensionSession('normal', questions, () => new Date('2026-08-11T10:00:00.000Z'), () => 0.999)
    const question = session.questions[0]
    if (!question) throw new Error('問題がありません')

    expect(selectReadingComprehensionChoice(session, question.correctChoiceId).feedback).toBe('correct')
  })

  it('moves to the next question after a correct answer', () => {
    const session = createReadingComprehensionSession('normal', questions, () => new Date('2026-08-11T10:00:00.000Z'), () => 0.999)
    const question = session.questions[0]
    if (!question) throw new Error('問題がありません')

    const next = nextReadingComprehensionQuestion(selectReadingComprehensionChoice(session, question.correctChoiceId))

    expect(next.currentIndex).toBe(1)
    expect(next.selectedChoiceId).toBeNull()
    expect(next.feedback).toBe('none')
  })
})
