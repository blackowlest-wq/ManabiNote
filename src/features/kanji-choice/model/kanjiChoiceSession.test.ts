import { describe, expect, it } from 'vitest'
import { createKanjiChoiceQuestions } from './kanjiChoiceQuestion'
import { createKanjiChoiceSession, nextKanjiChoiceQuestion, selectKanjiChoice } from './kanjiChoiceSession'

const questions = createKanjiChoiceQuestions(() => 0.999)

describe('kanji choice session', () => {
  it('marks the matching kanji as correct', () => {
    const session = createKanjiChoiceSession(questions, () => new Date('2026-08-11T10:00:00.000Z'), () => 0.999)
    const question = session.questions[0]
    if (!question) throw new Error('問題がありません')

    expect(selectKanjiChoice(session, question.correctChoiceId).feedback).toBe('correct')
  })

  it('moves to the next question after a correct answer', () => {
    const session = createKanjiChoiceSession(questions, () => new Date('2026-08-11T10:00:00.000Z'), () => 0.999)
    const question = session.questions[0]
    if (!question) throw new Error('問題がありません')

    const next = nextKanjiChoiceQuestion(selectKanjiChoice(session, question.correctChoiceId))

    expect(next.currentIndex).toBe(1)
    expect(next.feedback).toBe('none')
  })
})
