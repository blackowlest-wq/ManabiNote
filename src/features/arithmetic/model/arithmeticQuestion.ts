import { QuestionDataError } from '../../question-types/kana-to-picture/model/validator'
import type { ArithmeticKind, ArithmeticQuestion } from './types'

type ArithmeticSource = {
  id: string
  left: number
  right: number
  choices: readonly number[]
}

const QUESTION_SOURCES: Record<ArithmeticKind, readonly ArithmeticSource[]> = {
  addition: [
    { id: 'addition-1-1', left: 1, right: 1, choices: [2, 1, 3, 4] },
    { id: 'addition-2-1', left: 2, right: 1, choices: [3, 2, 4, 5] },
    { id: 'addition-2-3', left: 2, right: 3, choices: [5, 4, 6, 7] },
    { id: 'addition-4-2', left: 4, right: 2, choices: [6, 5, 7, 8] },
    { id: 'addition-3-4', left: 3, right: 4, choices: [7, 6, 8, 9] },
    { id: 'addition-5-3', left: 5, right: 3, choices: [8, 7, 9, 10] },
    { id: 'addition-4-5', left: 4, right: 5, choices: [9, 7, 8, 10] },
    { id: 'addition-6-4', left: 6, right: 4, choices: [10, 7, 8, 9] },
  ],
  subtraction: [
    { id: 'subtraction-2-1', left: 2, right: 1, choices: [1, 0, 2, 3] },
    { id: 'subtraction-4-2', left: 4, right: 2, choices: [2, 1, 3, 4] },
    { id: 'subtraction-5-2', left: 5, right: 2, choices: [3, 2, 4, 5] },
    { id: 'subtraction-6-4', left: 6, right: 4, choices: [2, 1, 3, 5] },
    { id: 'subtraction-7-3', left: 7, right: 3, choices: [4, 3, 5, 6] },
    { id: 'subtraction-8-3', left: 8, right: 3, choices: [5, 4, 6, 7] },
    { id: 'subtraction-9-4', left: 9, right: 4, choices: [5, 3, 4, 6] },
    { id: 'subtraction-10-3', left: 10, right: 3, choices: [7, 5, 6, 8] },
  ],
}

const shuffle = <T,>(items: readonly T[], random: () => number): T[] => {
  const shuffled = [...items]
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1))
    ;[shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]]
  }
  return shuffled
}

const calculate = (kind: ArithmeticKind, left: number, right: number) => (
  kind === 'addition' ? left + right : left - right
)

export function createArithmeticQuestions(
  kind: ArithmeticKind,
  random: () => number = Math.random,
): ArithmeticQuestion[] {
  return QUESTION_SOURCES[kind].map((source) => {
    const answer = calculate(kind, source.left, source.right)
    if (answer < 0 || answer > 10 || source.choices.length !== 4 || new Set(source.choices).size !== 4 || !source.choices.includes(answer)) {
      throw new QuestionDataError()
    }

    const choices = shuffle(source.choices, random).map((value, index) => ({
      id: `${source.id}-choice-${index}`,
      value,
    }))
    const correctChoice = choices.find((choice) => choice.value === answer)
    if (!correctChoice) throw new QuestionDataError()

    return {
      id: source.id,
      kind,
      left: source.left,
      right: source.right,
      answer,
      choices,
      correctChoiceId: correctChoice.id,
    }
  })
}
