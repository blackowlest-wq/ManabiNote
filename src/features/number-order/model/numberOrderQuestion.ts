import { QuestionDataError } from '../../question-types/kana-to-picture/model/validator'
import type { NumberOrderQuestion } from './types'

type NumberOrderSource = {
  id: string
  sequence: readonly (number | null)[]
  answer: number
  choices: readonly number[]
}

const QUESTION_SOURCES: readonly NumberOrderSource[] = [
  { id: 'number-order-1-5', sequence: [1, 2, null, 4, 5], answer: 3, choices: [3, 6, 7, 8] },
  { id: 'number-order-2-6', sequence: [2, 3, 4, null, 6], answer: 5, choices: [5, 1, 7, 8] },
  { id: 'number-order-3-7', sequence: [3, null, 5, 6, 7], answer: 4, choices: [4, 2, 8, 9] },
  { id: 'number-order-5-9', sequence: [5, 6, null, 8, 9], answer: 7, choices: [7, 3, 4, 10] },
  { id: 'number-order-6-10', sequence: [6, 7, 8, 9, null], answer: 10, choices: [10, 4, 5, 11] },
  { id: 'number-order-10-14', sequence: [10, null, 12, 13, 14], answer: 11, choices: [11, 8, 9, 15] },
  { id: 'number-order-12-16', sequence: [12, 13, null, 15, 16], answer: 14, choices: [14, 10, 11, 17] },
]

const shuffle = <T,>(items: readonly T[], random: () => number): T[] => {
  const shuffled = [...items]
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1))
    ;[shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]]
  }
  return shuffled
}

export function createNumberOrderQuestions(random: () => number = Math.random): NumberOrderQuestion[] {
  return QUESTION_SOURCES.map((source) => {
    if (source.sequence.filter((value) => value === null).length !== 1 || !source.choices.includes(source.answer)) {
      throw new QuestionDataError()
    }

    const choices = shuffle(source.choices, random).map((value, index) => ({
      id: `${source.id}-choice-${index}`,
      value,
    }))
    const correctChoice = choices.find((choice) => choice.value === source.answer)
    if (!correctChoice) throw new QuestionDataError()

    return {
      id: source.id,
      sequence: source.sequence,
      answer: source.answer,
      choices,
      correctChoiceId: correctChoice.id,
    }
  })
}
