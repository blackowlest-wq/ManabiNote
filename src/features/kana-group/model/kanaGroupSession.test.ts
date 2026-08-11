import { describe, expect, it } from 'vitest'
import { createKanaGroupQuestions } from './kanaGroupQuestion'
import { createKanaGroupSession, isKanaGroupComplete, nextKanaGroupQuestion, selectKanaGroupChoice } from './kanaGroupSession'

const fixedNow = () => new Date('2026-08-11T13:00:00.000Z')

describe('kana group session', () => {
  it('selects five unique questions', () => {
    const session = createKanaGroupSession(createKanaGroupQuestions(() => 0.999), fixedNow, () => 0.999)

    expect(session.questions).toHaveLength(5)
    expect(new Set(session.questions.map((question) => question.id)).size).toBe(5)
  })

  it('allows retry after an incorrect group', () => {
    const session = createKanaGroupSession(createKanaGroupQuestions(() => 0.999), fixedNow, () => 0.999)
    const question = session.questions[0]
    if (!question) throw new Error('テスト問題が見つかりません')
    const wrongChoice = question.choices.find((choice) => choice.id !== question.correctChoiceId)
    if (!wrongChoice) throw new Error('不正解の選択肢が見つかりません')

    const incorrect = selectKanaGroupChoice(session, wrongChoice.id)
    expect(incorrect.feedback).toBe('incorrect')
    expect(selectKanaGroupChoice(incorrect, question.correctChoiceId).feedback).toBe('correct')
  })

  it('completes after five correct answers', () => {
    let session = createKanaGroupSession(createKanaGroupQuestions(() => 0.999), fixedNow, () => 0.999)

    for (let index = 0; index < 5; index += 1) {
      const question = session.questions[session.currentIndex]
      if (!question) throw new Error('テスト問題が見つかりません')
      session = nextKanaGroupQuestion(selectKanaGroupChoice(session, question.correctChoiceId))
    }

    expect(isKanaGroupComplete(session)).toBe(true)
  })
})
