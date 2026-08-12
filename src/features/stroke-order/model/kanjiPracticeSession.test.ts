import { describe, expect, it } from 'vitest'
import { loadKanjiStrokeQuestions } from '../../question-types/kanji-to-stroke/model/loader'
import {
  advanceKanjiCharacter,
  createKanjiPracticeSession,
  recordKanjiStrokeFailure,
  recordKanjiStrokeSuccess,
} from './kanjiPracticeSession'

const questions = loadKanjiStrokeQuestions()
const fixedClock = () => new Date('2026-08-13T10:00:00.000Z')

const completeCurrentCharacter = (session: ReturnType<typeof createKanjiPracticeSession>) => {
  let nextSession = session
  const strokeCount = nextSession.questions[nextSession.currentQuestionIndex].strokes.length

  for (let index = 0; index < strokeCount; index += 1) {
    nextSession = recordKanjiStrokeSuccess(nextSession)
  }

  return nextSession
}

describe('kanjiPracticeSession', () => {
  it('selects five first-grade kanji and starts at the first stroke', () => {
    const session = createKanjiPracticeSession(questions, fixedClock, () => 0.999)

    expect(session.questions).toHaveLength(5)
    expect(session.currentQuestionIndex).toBe(0)
    expect(session.currentStrokeIndex).toBe(0)
    expect(session.status).toBe('active')
    expect(session.attempts).toEqual([0, 0, 0, 0, 0])
  })

  it('counts failures without advancing and advances after a successful stroke', () => {
    const session = createKanjiPracticeSession(questions.slice(1, 6), fixedClock, () => 0.999)
    const failed = recordKanjiStrokeFailure(session)
    const succeeded = recordKanjiStrokeSuccess(failed)

    expect(failed.attempts[0]).toBe(1)
    expect(succeeded.attempts[0]).toBe(2)
    expect(succeeded.currentStrokeIndex).toBe(1)
  })

  it('completes all five selected kanji in order', () => {
    let session = createKanjiPracticeSession(questions, fixedClock, () => 0.999)

    for (let index = 0; index < session.questions.length; index += 1) {
      session = completeCurrentCharacter(session)
      session = advanceKanjiCharacter(session)
    }

    expect(session.status).toBe('complete')
    expect(session.currentQuestionIndex).toBe(5)
  })
})
