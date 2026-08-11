import { describe, expect, it } from 'vitest'
import { createNumberCompareQuestions } from './numberCompareQuestion'
import {
  createNumberCompareSession,
  isNumberCompareComplete,
  nextNumberCompareQuestion,
  selectNumberCompareChoice,
} from './numberCompareSession'

const questions = createNumberCompareQuestions(() => 0.999)

describe('number compare session', () => {
  it('accepts the larger number and advances', () => {
    const session = createNumberCompareSession(questions, () => new Date('2026-08-11T10:00:00.000Z'), () => 0.999)
    const question = session.questions[0]
    if (!question) throw new Error('問題がありません')

    const answered = selectNumberCompareChoice(session, question.correctChoiceId)

    expect(answered.feedback).toBe('correct')
    expect(nextNumberCompareQuestion(answered).currentIndex).toBe(1)
    expect(isNumberCompareComplete(answered)).toBe(false)
  })

  it('keeps the question open after an incorrect choice', () => {
    const session = createNumberCompareSession(questions, () => new Date('2026-08-11T10:00:00.000Z'), () => 0.999)
    const question = session.questions[0]
    if (!question) throw new Error('問題がありません')
    const wrongChoice = question.choices.find((choice) => choice.id !== question.correctChoiceId)
    if (!wrongChoice) throw new Error('まちがいの選択肢がありません')

    expect(selectNumberCompareChoice(session, wrongChoice.id).feedback).toBe('incorrect')
  })
})
