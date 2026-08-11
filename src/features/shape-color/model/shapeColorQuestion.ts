import type { ShapeColor, ShapeColorQuestion, ShapeName } from './types'

const SHAPES: readonly ShapeName[] = ['circle', 'triangle', 'square', 'star']
const COLORS: readonly ShapeColor[] = ['red', 'blue', 'yellow', 'green']

const shuffle = <T,>(items: readonly T[], random: () => number): T[] => {
  const shuffled = [...items]
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1))
    ;[shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]]
  }
  return shuffled
}

export function createShapeColorQuestions(random: () => number = Math.random): ShapeColorQuestion[] {
  return COLORS.flatMap((color, colorIndex) => SHAPES.slice(0, 3).map((shape, shapeIndex) => {
    const otherShape = SHAPES[(shapeIndex + 1) % SHAPES.length]
    const anotherShape = SHAPES[(shapeIndex + 2) % SHAPES.length]
    const otherColor = COLORS[(colorIndex + 1) % COLORS.length]
    const anotherColor = COLORS[(colorIndex + 2) % COLORS.length]
    const choicesWithoutIds = [
      { shape, color },
      { shape: otherShape, color },
      { shape, color: otherColor },
      { shape: anotherShape, color: anotherColor },
    ]
    const choices = shuffle(choicesWithoutIds, random).map((choice, choiceIndex) => ({
      ...choice,
      id: `shape-color-${color}-${shape}-choice-${choiceIndex}`,
    }))
    const correctChoice = choices.find((choice) => choice.shape === shape && choice.color === color)
    if (!correctChoice) throw new Error('色と形の問題を作成できません')

    return {
      id: `shape-color-${color}-${shape}`,
      targetShape: shape,
      targetColor: color,
      choices,
      correctChoiceId: correctChoice.id,
    }
  }))
}
