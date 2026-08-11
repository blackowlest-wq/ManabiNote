import { describe, expect, it } from 'vitest'
import { loadKanaToPictureQuestions } from '../../question-types/kana-to-picture/model/loader'
import { createCountingQuestions } from './countingQuestion'
import { createCountingSession, isCountingComplete, nextCountingQuestion, selectCountingChoice } from './countingSession'

const questions = loadKanaToPictureQuestions()
const fixedNow = () => new Date('2026-08-11T14:00:00.000Z')

describe('counting session', () => {
  it('creates picture-counting questions with five number choices', () => {
    const countingQuestions = createCountingQuestions(questions, () => 0.999)
    const session = createCountingSession(countingQuestions, fixedNow, () => 0.999)

    expect(countingQuestions.length).toBeGreaterThanOrEqual(5)
    expect(session.questions).toHaveLength(5)
    expect(session.questions.every((question) => question.choices.length === 5)).toBe(true)
    expect(session.questions.every((question) => question.choices.some((choice) => choice.count === question.count))).toBe(true)
  })

  it('allows a retry after an incorrect number', () => {
    const session = createCountingSession(createCountingQuestions(questions, () => 0.999), fixedNow, () => 0.999)
    const question = session.questions[0]
    if (!question) throw new Error('テスト問題が見つかりません')
    const wrongChoice = question.choices.find((choice) => choice.id !== question.correctChoiceId)
    if (!wrongChoice) throw new Error('不正解の選択肢が見つかりません')

    const incorrect = selectCountingChoice(session, wrongChoice.id)
    expect(incorrect.feedback).toBe('incorrect')
    expect(selectCountingChoice(incorrect, question.correctChoiceId).feedback).toBe('correct')
  })

  it('completes after five correct answers', () => {
    let session = createCountingSession(createCountingQuestions(questions, () => 0.999), fixedNow, () => 0.999)

    for (let index = 0; index < 5; index += 1) {
      const question = session.questions[session.currentIndex]
      if (!question) throw new Error('テスト問題が見つかりません')
      session = nextCountingQuestion(selectCountingChoice(session, question.correctChoiceId))
    }

    expect(isCountingComplete(session)).toBe(true)
  })
})
