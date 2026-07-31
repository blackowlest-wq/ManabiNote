import { describe, expect, it } from 'vitest'
import { loadStrokeQuestionsForRow } from '../../question-types/kana-to-stroke/model/loader'
import { getStrokeRow, type StrokeRowId } from '../../question-types/kana-to-stroke/model/kanaRows'
import {
  advanceCharacter,
  createPracticeSession,
  getCurrentQuestion,
  isPracticeComplete,
  recordStrokeFailure,
  recordStrokeSuccess,
} from './practiceSession'

const rowId: StrokeRowId = 'a'
const questions = loadStrokeQuestionsForRow(rowId)
const fixedClock = () => new Date('2026-07-31T10:00:00.000Z')

const completeCurrentCharacter = (session: ReturnType<typeof createPracticeSession>) => {
  let nextSession = session
  const strokeCount = nextSession.questions[nextSession.currentQuestionIndex].strokes.length

  for (let index = 0; index < strokeCount; index += 1) {
    nextSession = recordStrokeSuccess(nextSession)
  }

  return nextSession
}

describe('practice session', () => {
  it('starts at あ with five zero-attempt characters and the selected row', () => {
    const session = createPracticeSession(questions, rowId, fixedClock)

    expect(session.rowId).toBe(rowId)
    expect(session.currentQuestionIndex).toBe(0)
    expect(session.currentStrokeIndex).toBe(0)
    expect(session.status).toBe('active')
    expect(session.attempts).toEqual([0, 0, 0, 0, 0])
    expect(getCurrentQuestion(session)?.kana).toBe('あ')
  })

  it('counts a failed attempt without advancing the current stroke', () => {
    const session = createPracticeSession(questions, rowId, fixedClock)
    const failed = recordStrokeFailure(session)

    expect(failed.attempts).toEqual([1, 0, 0, 0, 0])
    expect(failed.currentQuestionIndex).toBe(0)
    expect(failed.currentStrokeIndex).toBe(0)
    expect(failed.status).toBe('active')
  })

  it('advances the stroke and counts a successful attempt', () => {
    const session = createPracticeSession(questions, rowId, fixedClock)
    const succeeded = recordStrokeSuccess(session)

    expect(succeeded.attempts[0]).toBe(1)
    expect(succeeded.currentQuestionIndex).toBe(0)
    expect(succeeded.currentStrokeIndex).toBe(1)
    expect(succeeded.status).toBe('active')
  })

  it('marks a character complete after its final stroke', () => {
    const session = completeCurrentCharacter(createPracticeSession(questions, rowId, fixedClock))

    expect(session.currentQuestionIndex).toBe(0)
    expect(session.status).toBe('character-complete')
    expect(session.attempts[0]).toBe(questions[0].strokes.length)
  })

  it('moves to い and resets the stroke index after character completion', () => {
    const completedA = completeCurrentCharacter(createPracticeSession(questions, rowId, fixedClock))
    const next = advanceCharacter(completedA)

    expect(next.currentQuestionIndex).toBe(1)
    expect(next.currentStrokeIndex).toBe(0)
    expect(next.status).toBe('active')
    expect(getCurrentQuestion(next)?.kana).toBe('い')
  })

  it('completes after advancing beyond お', () => {
    let session = createPracticeSession(questions, rowId, fixedClock)

    for (let questionIndex = 0; questionIndex < questions.length; questionIndex += 1) {
      session = completeCurrentCharacter(session)
      session = advanceCharacter(session)
    }

    expect(isPracticeComplete(session)).toBe(true)
    expect(session.status).toBe('complete')
    expect(getCurrentQuestion(session)).toBeNull()
  })

  it('rejects transitions after the practice is complete', () => {
    let session = createPracticeSession(questions, rowId, fixedClock)

    for (let questionIndex = 0; questionIndex < questions.length; questionIndex += 1) {
      session = completeCurrentCharacter(session)
      session = advanceCharacter(session)
    }

    expect(() => recordStrokeSuccess(session)).toThrow()
    expect(() => recordStrokeFailure(session)).toThrow()
    expect(() => advanceCharacter(session)).toThrow()
  })

  it('accepts a different selected row with its own character count', () => {
    const kaQuestions = loadStrokeQuestionsForRow('ka')
    const session = createPracticeSession(kaQuestions, 'ka', fixedClock)

    expect(session.rowId).toBe('ka')
    expect(session.questions.map((question) => question.kana)).toEqual(getStrokeRow('ka').kana)
    expect(session.attempts).toEqual([0, 0, 0, 0, 0])
  })

  it('rejects a question list that does not match the selected row', () => {
    expect(() => createPracticeSession([...questions].reverse(), rowId, fixedClock)).toThrow()
    expect(() => createPracticeSession(loadStrokeQuestionsForRow('ka'), rowId, fixedClock)).toThrow()
  })
})
