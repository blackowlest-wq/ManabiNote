import { QuestionDataError } from '../../question-types/kana-to-picture/model/validator'
import type { GameDifficulty } from '../../../shared/gameDifficulty'
import type { ArithmeticKind, ArithmeticQuestion } from './types'

type ArithmeticSource = {
  id: string
  left: number
  right: number
  choices: readonly number[]
}

const QUESTION_SOURCES: Record<ArithmeticKind, Record<GameDifficulty, readonly ArithmeticSource[]>> = {
  addition: {
    easy: [
      { id: 'addition-easy-1-1', left: 1, right: 1, choices: [2, 1, 3, 4] },
      { id: 'addition-easy-2-1', left: 2, right: 1, choices: [3, 2, 4, 5] },
      { id: 'addition-easy-2-2', left: 2, right: 2, choices: [4, 2, 3, 5] },
      { id: 'addition-easy-3-1', left: 3, right: 1, choices: [4, 2, 3, 5] },
      { id: 'addition-easy-3-2', left: 3, right: 2, choices: [5, 2, 3, 4] },
      { id: 'addition-easy-4-1', left: 4, right: 1, choices: [5, 2, 3, 4] },
      { id: 'addition-easy-0-4', left: 0, right: 4, choices: [4, 1, 3, 5] },
    ],
    normal: [
      { id: 'addition-1-1', left: 1, right: 1, choices: [2, 1, 3, 4] },
      { id: 'addition-2-1', left: 2, right: 1, choices: [3, 2, 4, 5] },
      { id: 'addition-2-3', left: 2, right: 3, choices: [5, 4, 6, 7] },
      { id: 'addition-4-2', left: 4, right: 2, choices: [6, 5, 7, 8] },
      { id: 'addition-3-4', left: 3, right: 4, choices: [7, 6, 8, 9] },
      { id: 'addition-5-3', left: 5, right: 3, choices: [8, 7, 9, 10] },
      { id: 'addition-4-5', left: 4, right: 5, choices: [9, 7, 8, 10] },
      { id: 'addition-6-4', left: 6, right: 4, choices: [10, 7, 8, 9] },
    ],
    hard: [
      { id: 'addition-hard-7-5', left: 7, right: 5, choices: [12, 11, 13, 14] },
      { id: 'addition-hard-8-5', left: 8, right: 5, choices: [13, 11, 12, 14] },
      { id: 'addition-hard-9-6', left: 9, right: 6, choices: [15, 13, 14, 16] },
      { id: 'addition-hard-8-9', left: 8, right: 9, choices: [17, 15, 16, 18] },
      { id: 'addition-hard-7-11', left: 7, right: 11, choices: [18, 16, 17, 19] },
      { id: 'addition-hard-12-7', left: 12, right: 7, choices: [19, 16, 18, 20] },
      { id: 'addition-hard-11-9', left: 11, right: 9, choices: [20, 17, 18, 19] },
      { id: 'addition-hard-6-8', left: 6, right: 8, choices: [14, 12, 13, 15] },
    ],
  },
  subtraction: {
    easy: [
      { id: 'subtraction-easy-2-1', left: 2, right: 1, choices: [1, 0, 2, 3] },
      { id: 'subtraction-easy-3-1', left: 3, right: 1, choices: [2, 1, 3, 4] },
      { id: 'subtraction-easy-4-1', left: 4, right: 1, choices: [3, 1, 2, 4] },
      { id: 'subtraction-easy-4-2', left: 4, right: 2, choices: [2, 1, 3, 4] },
      { id: 'subtraction-easy-5-2', left: 5, right: 2, choices: [3, 1, 2, 4] },
      { id: 'subtraction-easy-5-3', left: 5, right: 3, choices: [2, 1, 3, 4] },
      { id: 'subtraction-easy-5-5', left: 5, right: 5, choices: [0, 1, 2, 3] },
    ],
    normal: [
      { id: 'subtraction-2-1', left: 2, right: 1, choices: [1, 0, 2, 3] },
      { id: 'subtraction-4-2', left: 4, right: 2, choices: [2, 1, 3, 4] },
      { id: 'subtraction-5-2', left: 5, right: 2, choices: [3, 2, 4, 5] },
      { id: 'subtraction-6-4', left: 6, right: 4, choices: [2, 1, 3, 5] },
      { id: 'subtraction-7-3', left: 7, right: 3, choices: [4, 3, 5, 6] },
      { id: 'subtraction-8-3', left: 8, right: 3, choices: [5, 4, 6, 7] },
      { id: 'subtraction-9-4', left: 9, right: 4, choices: [5, 3, 4, 6] },
      { id: 'subtraction-10-3', left: 10, right: 3, choices: [7, 5, 6, 8] },
    ],
    hard: [
      { id: 'subtraction-hard-12-5', left: 12, right: 5, choices: [7, 5, 6, 8] },
      { id: 'subtraction-hard-14-6', left: 14, right: 6, choices: [8, 6, 7, 9] },
      { id: 'subtraction-hard-15-8', left: 15, right: 8, choices: [7, 5, 6, 8] },
      { id: 'subtraction-hard-17-9', left: 17, right: 9, choices: [8, 7, 9, 10] },
      { id: 'subtraction-hard-18-7', left: 18, right: 7, choices: [11, 9, 10, 12] },
      { id: 'subtraction-hard-20-8', left: 20, right: 8, choices: [12, 10, 11, 13] },
      { id: 'subtraction-hard-19-6', left: 19, right: 6, choices: [13, 11, 12, 14] },
      { id: 'subtraction-hard-16-7', left: 16, right: 7, choices: [9, 7, 8, 10] },
    ],
  },
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
  difficulty: GameDifficulty = 'normal',
  random: () => number = Math.random,
): ArithmeticQuestion[] {
  const maximumAnswer = difficulty === 'easy' ? 5 : difficulty === 'normal' ? 10 : 20
  return QUESTION_SOURCES[kind][difficulty].map((source) => {
    const answer = calculate(kind, source.left, source.right)
    if (answer < 0 || answer > maximumAnswer || source.choices.length !== 4 || new Set(source.choices).size !== 4 || !source.choices.includes(answer)) {
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
