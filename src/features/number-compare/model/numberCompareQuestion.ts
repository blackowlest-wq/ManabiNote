import { QuestionDataError } from '../../question-types/kana-to-picture/model/validator'
import type { NumberCompareQuestion, NumberCompareSide } from './types'

type NumberPair = {
  left: number
  right: number
}

const NUMBER_PAIRS: readonly NumberPair[] = [
  { left: 1, right: 3 },
  { left: 5, right: 2 },
  { left: 4, right: 8 },
  { left: 9, right: 6 },
  { left: 7, right: 10 },
  { left: 2, right: 6 },
  { left: 8, right: 5 },
]

const shuffle = <T,>(items: readonly T[], random: () => number): T[] => {
  const shuffled = [...items]
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1))
    ;[shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]]
  }
  return shuffled
}

export function createNumberCompareQuestions(random: () => number = Math.random): NumberCompareQuestion[] {
  return NUMBER_PAIRS.map((pair) => {
    if (pair.left === pair.right || pair.left < 1 || pair.right < 1) throw new QuestionDataError()

    const sides: readonly NumberCompareSide[] = ['left', 'right']
    const choices = shuffle(sides, random).map((side, index) => ({
      id: `number-compare-${pair.left}-${pair.right}-choice-${index}`,
      side,
      value: side === 'left' ? pair.left : pair.right,
    }))
    const correctChoice = choices.find((choice) => choice.value === Math.max(pair.left, pair.right))
    if (!correctChoice) throw new QuestionDataError()

    return {
      id: `number-compare-${pair.left}-${pair.right}`,
      left: pair.left,
      right: pair.right,
      choices,
      correctChoiceId: correctChoice.id,
    }
  })
}
