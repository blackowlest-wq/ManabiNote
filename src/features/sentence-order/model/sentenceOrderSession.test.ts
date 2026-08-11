import { describe, expect, it } from 'vitest'
import { createSentenceOrderQuestions } from './sentenceOrderQuestion'
import {
  createSentenceOrderSession,
  isSentenceOrderComplete,
  nextSentenceOrderQuestion,
  selectSentenceOrderChoice,
  submitSentenceOrder,
  undoSentenceOrderChoice,
} from './sentenceOrderSession'

const questions = createSentenceOrderQuestions('normal', () => 0.999)

describe('sentence order session', () => {
  it('checks a selected sentence and moves to the next question', () => {
    const session = createSentenceOrderSession('normal', questions, () => new Date('2026-08-11T10:00:00.000Z'), () => 0.999)
    const question = session.questions[0]
    if (!question) throw new Error('問題がありません')

    const selected = question.correctChoiceIds.reduce(selectSentenceOrderChoice, session)
    const answered = submitSentenceOrder(selected)

    expect(answered.feedback).toBe('correct')
    const next = nextSentenceOrderQuestion(answered)
    expect(next.currentIndex).toBe(1)
    expect(next.selectedChoiceIds).toEqual([])
    expect(isSentenceOrderComplete(next)).toBe(false)
  })

  it('keeps an incorrect sentence editable with undo', () => {
    const session = createSentenceOrderSession('normal', questions, () => new Date('2026-08-11T10:00:00.000Z'), () => 0.999)
    const question = session.questions[0]
    if (!question) throw new Error('問題がありません')
    const wrongChoice = question.choices.find((choice) => choice.id !== question.correctChoiceIds[0])
    if (!wrongChoice) throw new Error('まちがいの選択肢がありません')

    const incorrect = submitSentenceOrder(selectSentenceOrderChoice(session, wrongChoice.id))

    expect(incorrect.feedback).toBe('incorrect')
    expect(undoSentenceOrderChoice(incorrect).selectedChoiceIds).toEqual([])
  })
})
