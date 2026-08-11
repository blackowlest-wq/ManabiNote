import { describe, expect, it } from 'vitest'
import { createSmallKanaQuestions } from './smallKanaQuestion'
import { createSmallKanaSession, isSmallKanaComplete, nextSmallKanaQuestion, selectSmallKanaChoice } from './smallKanaSession'

const fixedNow = () => new Date('2026-08-11T14:00:00.000Z')

describe('small kana session', () => {
  it('selects five different small kana questions', () => {
    const session = createSmallKanaSession(createSmallKanaQuestions(), fixedNow, () => 0.999)

    expect(session.questions).toHaveLength(5)
    expect(new Set(session.questions.map((question) => question.id)).size).toBe(5)
  })

  it('allows a retry after an incorrect choice', () => {
    const session = createSmallKanaSession(createSmallKanaQuestions(), fixedNow, () => 0.999)
    const question = session.questions[0]
    if (!question) throw new Error('テスト問題が見つかりません')
    const wrongChoice = question.choices.find((choice) => choice.id !== question.correctChoiceId)
    if (!wrongChoice) throw new Error('不正解の選択肢が見つかりません')

    const incorrect = selectSmallKanaChoice(session, wrongChoice.id)
    expect(incorrect.feedback).toBe('incorrect')
    expect(selectSmallKanaChoice(incorrect, question.correctChoiceId).feedback).toBe('correct')
  })

  it('completes after five correct answers', () => {
    let session = createSmallKanaSession(createSmallKanaQuestions(), fixedNow, () => 0.999)

    for (let index = 0; index < 5; index += 1) {
      const question = session.questions[session.currentIndex]
      if (!question) throw new Error('テスト問題が見つかりません')
      session = nextSmallKanaQuestion(selectSmallKanaChoice(session, question.correctChoiceId))
    }

    expect(isSmallKanaComplete(session)).toBe(true)
  })
})
