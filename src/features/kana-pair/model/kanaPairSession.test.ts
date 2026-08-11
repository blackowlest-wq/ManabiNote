import { describe, expect, it } from 'vitest'
import { createKanaPairQuestions } from './kanaPairQuestion'
import {
  createKanaPairSession,
  isKanaPairComplete,
  nextKanaPairQuestion,
  selectKanaPairChoice,
} from './kanaPairSession'

const fixedNow = () => new Date('2026-08-11T11:00:00.000Z')

describe('kana pair session', () => {
  it('selects five unique questions', () => {
    const session = createKanaPairSession(createKanaPairQuestions(() => 0.999), fixedNow, () => 0.999)

    expect(session.questions).toHaveLength(5)
    expect(new Set(session.questions.map((question) => question.id)).size).toBe(5)
    expect(session.selectedChoiceId).toBeNull()
    expect(session.feedback).toBe('none')
  })

  it('allows retry after an incorrect choice and marks the matching katakana correct', () => {
    const session = createKanaPairSession(createKanaPairQuestions(() => 0.999), fixedNow, () => 0.999)
    const question = session.questions[0]
    if (!question) throw new Error('テスト問題が見つかりません')
    const wrongChoice = question.choices.find((choice) => choice.id !== question.correctChoiceId)
    if (!wrongChoice) throw new Error('不正解の選択肢が見つかりません')

    expect(selectKanaPairChoice(session, wrongChoice.id).feedback).toBe('incorrect')
    expect(selectKanaPairChoice(selectKanaPairChoice(session, wrongChoice.id), question.correctChoiceId).feedback).toBe('correct')
  })

  it('completes after advancing through five correct answers', () => {
    let session = createKanaPairSession(createKanaPairQuestions(() => 0.999), fixedNow, () => 0.999)

    for (let index = 0; index < 5; index += 1) {
      const question = session.questions[session.currentIndex]
      if (!question) throw new Error('テスト問題が見つかりません')
      session = nextKanaPairQuestion(selectKanaPairChoice(session, question.correctChoiceId))
    }

    expect(isKanaPairComplete(session)).toBe(true)
    expect(session.currentIndex).toBe(5)
  })
})
