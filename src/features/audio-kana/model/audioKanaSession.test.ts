import { describe, expect, it } from 'vitest'
import { createAudioKanaQuestions } from './audioKanaQuestion'
import { createAudioKanaSession, isAudioKanaComplete, nextAudioKanaQuestion, selectAudioKanaChoice } from './audioKanaSession'

const fixedNow = () => new Date('2026-08-11T14:00:00.000Z')

describe('audio kana session', () => {
  it('selects five unique audio questions', () => {
    const session = createAudioKanaSession(createAudioKanaQuestions(() => 0.999), fixedNow, () => 0.999)

    expect(session.questions).toHaveLength(5)
    expect(new Set(session.questions.map((question) => question.id)).size).toBe(5)
  })

  it('allows retry after an incorrect choice', () => {
    const session = createAudioKanaSession(createAudioKanaQuestions(() => 0.999), fixedNow, () => 0.999)
    const question = session.questions[0]
    if (!question) throw new Error('テスト問題が見つかりません')
    const wrongChoice = question.choices.find((choice) => choice.id !== question.correctChoiceId)
    if (!wrongChoice) throw new Error('不正解の選択肢が見つかりません')

    const incorrect = selectAudioKanaChoice(session, wrongChoice.id)
    expect(incorrect.feedback).toBe('incorrect')
    expect(selectAudioKanaChoice(incorrect, question.correctChoiceId).feedback).toBe('correct')
  })

  it('completes after five correct answers', () => {
    let session = createAudioKanaSession(createAudioKanaQuestions(() => 0.999), fixedNow, () => 0.999)

    for (let index = 0; index < 5; index += 1) {
      const question = session.questions[session.currentIndex]
      if (!question) throw new Error('テスト問題が見つかりません')
      session = nextAudioKanaQuestion(selectAudioKanaChoice(session, question.correctChoiceId))
    }

    expect(isAudioKanaComplete(session)).toBe(true)
  })
})
