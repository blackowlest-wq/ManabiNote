import { describe, expect, it } from 'vitest'
import { loadKanaToPictureQuestions } from '../../question-types/kana-to-picture/model/loader'
import { createShiritoriQuestions } from './shiritoriQuestion'
import { createShiritoriSession, isShiritoriComplete, nextShiritoriQuestion, selectShiritoriChoice } from './shiritoriSession'

const questions = loadKanaToPictureQuestions()
const fixedNow = () => new Date('2026-08-11T14:00:00.000Z')

describe('shiritori session', () => {
  it('creates five questions whose correct word starts with the previous word ending', () => {
    const shiritoriQuestions = createShiritoriQuestions(questions, () => 0.999)
    const session = createShiritoriSession(shiritoriQuestions, fixedNow, () => 0.999)

    expect(session.questions).toHaveLength(5)
    expect(new Set(session.questions.map((question) => question.id)).size).toBe(5)
    for (const question of session.questions) {
      const correctChoice = question.choices.find((choice) => choice.id === question.correctChoiceId)
      if (!correctChoice) throw new Error('正解の選択肢が見つかりません')
      expect(correctChoice.reading[0]).toBe(question.previousReading.slice(-1))
    }
  })

  it('allows a retry after an incorrect choice', () => {
    const session = createShiritoriSession(createShiritoriQuestions(questions, () => 0.999), fixedNow, () => 0.999)
    const question = session.questions[0]
    if (!question) throw new Error('テスト問題が見つかりません')
    const wrongChoice = question.choices.find((choice) => choice.id !== question.correctChoiceId)
    if (!wrongChoice) throw new Error('不正解の選択肢が見つかりません')

    const incorrect = selectShiritoriChoice(session, wrongChoice.id)
    expect(incorrect.feedback).toBe('incorrect')
    expect(selectShiritoriChoice(incorrect, question.correctChoiceId).feedback).toBe('correct')
  })

  it('completes after five correct answers', () => {
    let session = createShiritoriSession(createShiritoriQuestions(questions, () => 0.999), fixedNow, () => 0.999)

    for (let index = 0; index < 5; index += 1) {
      const question = session.questions[session.currentIndex]
      if (!question) throw new Error('テスト問題が見つかりません')
      session = nextShiritoriQuestion(selectShiritoriChoice(session, question.correctChoiceId))
    }

    expect(isShiritoriComplete(session)).toBe(true)
  })
})
