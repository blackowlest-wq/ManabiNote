import { describe, expect, it } from 'vitest'
import { createNumberOrderQuestions } from './numberOrderQuestion'
import {
  createNumberOrderSession,
  isNumberOrderComplete,
  nextNumberOrderQuestion,
  selectNumberOrderChoice,
} from './numberOrderSession'

const questions = createNumberOrderQuestions(() => 0.999)

describe('number order session', () => {
  it('accepts the missing number and advances', () => {
    const session = createNumberOrderSession(questions, () => new Date('2026-08-11T10:00:00.000Z'), () => 0.999)
    const question = session.questions[0]
    if (!question) throw new Error('問題がありません')

    const answered = selectNumberOrderChoice(session, question.correctChoiceId)

    expect(answered.feedback).toBe('correct')
    expect(nextNumberOrderQuestion(answered).currentIndex).toBe(1)
    expect(isNumberOrderComplete(answered)).toBe(false)
  })

  it('keeps the question open after an incorrect choice', () => {
    const session = createNumberOrderSession(questions, () => new Date('2026-08-11T10:00:00.000Z'), () => 0.999)
    const question = session.questions[0]
    if (!question) throw new Error('問題がありません')
    const wrongChoice = question.choices.find((choice) => choice.id !== question.correctChoiceId)
    if (!wrongChoice) throw new Error('まちがいの選択肢がありません')

    expect(selectNumberOrderChoice(session, wrongChoice.id).feedback).toBe('incorrect')
  })
})
