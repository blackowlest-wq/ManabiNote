import { describe, expect, it } from 'vitest'
import { createShapeColorQuestions } from './shapeColorQuestion'
import { createShapeColorSession, isShapeColorComplete, nextShapeColorQuestion, selectShapeColorChoice } from './shapeColorSession'

const fixedNow = () => new Date('2026-08-11T14:00:00.000Z')

describe('shape and color session', () => {
  it('creates questions with one exact matching choice', () => {
    const questions = createShapeColorQuestions(() => 0.999)
    const session = createShapeColorSession(questions, fixedNow, () => 0.999)

    expect(session.questions).toHaveLength(5)
    for (const question of session.questions) {
      const correctChoice = question.choices.find((choice) => choice.id === question.correctChoiceId)
      if (!correctChoice) throw new Error('正解の選択肢が見つかりません')
      expect(correctChoice.shape).toBe(question.targetShape)
      expect(correctChoice.color).toBe(question.targetColor)
    }
  })

  it('allows a retry after an incorrect choice', () => {
    const session = createShapeColorSession(createShapeColorQuestions(() => 0.999), fixedNow, () => 0.999)
    const question = session.questions[0]
    if (!question) throw new Error('テスト問題が見つかりません')
    const wrongChoice = question.choices.find((choice) => choice.id !== question.correctChoiceId)
    if (!wrongChoice) throw new Error('不正解の選択肢が見つかりません')

    const incorrect = selectShapeColorChoice(session, wrongChoice.id)
    expect(incorrect.feedback).toBe('incorrect')
    expect(selectShapeColorChoice(incorrect, question.correctChoiceId).feedback).toBe('correct')
  })

  it('completes after five correct answers', () => {
    let session = createShapeColorSession(createShapeColorQuestions(() => 0.999), fixedNow, () => 0.999)

    for (let index = 0; index < 5; index += 1) {
      const question = session.questions[session.currentIndex]
      if (!question) throw new Error('テスト問題が見つかりません')
      session = nextShapeColorQuestion(selectShapeColorChoice(session, question.correctChoiceId))
    }

    expect(isShapeColorComplete(session)).toBe(true)
  })
})
