import { describe, expect, it } from 'vitest'
import { createDakutenQuestions } from './dakutenQuestion'
import { createDakutenSession, isDakutenComplete, nextDakutenQuestion, selectDakutenChoice } from './dakutenSession'

const fixedNow = () => new Date('2026-08-11T12:00:00.000Z')

describe('dakuten session', () => {
  it('selects five unique questions', () => {
    const session = createDakutenSession(createDakutenQuestions(() => 0.999), fixedNow, () => 0.999)

    expect(session.questions).toHaveLength(5)
    expect(new Set(session.questions.map((question) => question.id)).size).toBe(5)
    expect(session.feedback).toBe('none')
  })

  it('allows retry after an incorrect choice', () => {
    const session = createDakutenSession(createDakutenQuestions(() => 0.999), fixedNow, () => 0.999)
    const question = session.questions[0]
    if (!question) throw new Error('テスト問題が見つかりません')
    const wrongChoice = question.choices.find((choice) => choice.id !== question.correctChoiceId)
    if (!wrongChoice) throw new Error('不正解の選択肢が見つかりません')

    const incorrect = selectDakutenChoice(session, wrongChoice.id)
    expect(incorrect.feedback).toBe('incorrect')
    expect(selectDakutenChoice(incorrect, question.correctChoiceId).feedback).toBe('correct')
  })

  it('completes after five correct answers', () => {
    let session = createDakutenSession(createDakutenQuestions(() => 0.999), fixedNow, () => 0.999)

    for (let index = 0; index < 5; index += 1) {
      const question = session.questions[session.currentIndex]
      if (!question) throw new Error('テスト問題が見つかりません')
      session = nextDakutenQuestion(selectDakutenChoice(session, question.correctChoiceId))
    }

    expect(isDakutenComplete(session)).toBe(true)
  })
})
