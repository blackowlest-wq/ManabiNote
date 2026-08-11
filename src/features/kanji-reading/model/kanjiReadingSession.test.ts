import { describe, expect, it } from 'vitest'
import { createKanjiReadingQuestions } from './kanjiReadingQuestion'
import {
  createKanjiReadingSession,
  isKanjiReadingComplete,
  nextKanjiReadingQuestion,
  selectKanjiReadingChoice,
} from './kanjiReadingSession'

const questions = createKanjiReadingQuestions(() => 0.999)

describe('kanji reading session', () => {
  it('marks the selected reading as correct or incorrect', () => {
    const session = createKanjiReadingSession(questions, () => new Date('2026-08-11T10:00:00.000Z'), () => 0.999)
    const question = session.questions[0]
    if (!question) throw new Error('問題がありません')

    expect(selectKanjiReadingChoice(session, question.choices[0]?.id ?? '').feedback).toBe(
      question.choices[0]?.id === question.correctChoiceId ? 'correct' : 'incorrect',
    )
  })

  it('moves to the next question only after a correct answer', () => {
    const session = createKanjiReadingSession(questions, () => new Date('2026-08-11T10:00:00.000Z'), () => 0.999)
    const question = session.questions[0]
    if (!question) throw new Error('問題がありません')

    const correct = selectKanjiReadingChoice(session, question.correctChoiceId)
    const next = nextKanjiReadingQuestion(correct)

    expect(next.currentIndex).toBe(1)
    expect(next.selectedChoiceId).toBeNull()
    expect(isKanjiReadingComplete(next)).toBe(false)
  })
})
