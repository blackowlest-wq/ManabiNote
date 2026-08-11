import type { ShapeColor, ShapeName } from '../../shape-color/model/types'

export type ShapePatternToken = {
  shape: ShapeName
  color: ShapeColor
}

export type ShapePatternChoice = ShapePatternToken & {
  id: string
}

export type ShapePatternQuestion = {
  id: string
  sequence: readonly ShapePatternToken[]
  answer: ShapePatternToken
  choices: readonly ShapePatternChoice[]
  correctChoiceId: string
}
