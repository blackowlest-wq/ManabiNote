import { QuestionDataError } from '../../question-types/kana-to-picture/model/validator'
import type { ShapeColor, ShapeName } from '../../shape-color/model/types'
import type { ShapePatternQuestion, ShapePatternToken } from './types'

type ShapePatternSource = {
  id: string
  sequence: readonly ShapePatternToken[]
  answer: ShapePatternToken
  choices: readonly ShapePatternToken[]
}

const token = (shape: ShapeName, color: ShapeColor): ShapePatternToken => ({ shape, color })

const QUESTION_SOURCES: readonly ShapePatternSource[] = [
  {
    id: 'shape-pattern-red-blue-circle',
    sequence: [token('circle', 'red'), token('circle', 'blue'), token('circle', 'red'), token('circle', 'blue')],
    answer: token('circle', 'red'),
    choices: [token('circle', 'red'), token('circle', 'blue'), token('triangle', 'yellow'), token('square', 'green')],
  },
  {
    id: 'shape-pattern-yellow-green',
    sequence: [token('triangle', 'yellow'), token('square', 'green'), token('triangle', 'yellow'), token('square', 'green')],
    answer: token('triangle', 'yellow'),
    choices: [token('triangle', 'yellow'), token('square', 'green'), token('circle', 'red'), token('star', 'blue')],
  },
  {
    id: 'shape-pattern-red-shapes',
    sequence: [token('circle', 'red'), token('triangle', 'red'), token('square', 'red'), token('circle', 'red')],
    answer: token('triangle', 'red'),
    choices: [token('triangle', 'red'), token('square', 'red'), token('star', 'red'), token('circle', 'blue')],
  },
  {
    id: 'shape-pattern-square-colors',
    sequence: [token('square', 'blue'), token('square', 'green'), token('square', 'yellow'), token('square', 'blue')],
    answer: token('square', 'green'),
    choices: [token('square', 'green'), token('square', 'yellow'), token('square', 'red'), token('triangle', 'green')],
  },
  {
    id: 'shape-pattern-pairs',
    sequence: [token('circle', 'green'), token('circle', 'green'), token('star', 'yellow'), token('star', 'yellow')],
    answer: token('circle', 'green'),
    choices: [token('circle', 'green'), token('star', 'yellow'), token('circle', 'yellow'), token('star', 'green')],
  },
  {
    id: 'shape-pattern-three',
    sequence: [token('circle', 'red'), token('triangle', 'blue'), token('square', 'yellow'), token('circle', 'red')],
    answer: token('triangle', 'blue'),
    choices: [token('triangle', 'blue'), token('square', 'yellow'), token('circle', 'red'), token('star', 'green')],
  },
  {
    id: 'shape-pattern-star-square',
    sequence: [token('star', 'green'), token('square', 'red'), token('star', 'green'), token('square', 'red')],
    answer: token('star', 'green'),
    choices: [token('star', 'green'), token('square', 'red'), token('star', 'red'), token('square', 'green')],
  },
  {
    id: 'shape-pattern-yellow-shapes',
    sequence: [token('circle', 'yellow'), token('triangle', 'yellow'), token('circle', 'yellow'), token('triangle', 'yellow')],
    answer: token('circle', 'yellow'),
    choices: [token('circle', 'yellow'), token('triangle', 'yellow'), token('square', 'yellow'), token('circle', 'green')],
  },
]

const shapeLabels: Record<ShapeName, string> = {
  circle: 'まる',
  triangle: 'さんかく',
  square: 'しかく',
  star: 'ほし',
}

const colorLabels: Record<ShapeColor, string> = {
  red: 'あかい',
  blue: 'あおい',
  yellow: 'きいろい',
  green: 'みどりの',
}

export function getShapePatternLabel(value: ShapePatternToken): string {
  return `${colorLabels[value.color]} ${shapeLabels[value.shape]}`
}

const shuffle = <T,>(items: readonly T[], random: () => number): T[] => {
  const shuffled = [...items]
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1))
    ;[shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]]
  }
  return shuffled
}

export function createShapePatternQuestions(random: () => number = Math.random): ShapePatternQuestion[] {
  return QUESTION_SOURCES.map((source) => {
    const answerLabel = getShapePatternLabel(source.answer)
    if (source.sequence.length !== 4 || source.choices.length !== 4 || new Set(source.choices.map(getShapePatternLabel)).size !== 4 || !source.choices.some((choice) => getShapePatternLabel(choice) === answerLabel)) {
      throw new QuestionDataError()
    }

    const choices = shuffle(source.choices, random).map((choice, index) => ({
      ...choice,
      id: `${source.id}-choice-${index}`,
    }))
    const correctChoice = choices.find((choice) => getShapePatternLabel(choice) === answerLabel)
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
