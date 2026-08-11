export type ShapeName = 'circle' | 'triangle' | 'square' | 'star'
export type ShapeColor = 'red' | 'blue' | 'yellow' | 'green'

export type ShapeColorChoice = {
  id: string
  shape: ShapeName
  color: ShapeColor
}

export type ShapeColorQuestion = {
  id: string
  targetShape: ShapeName
  targetColor: ShapeColor
  choices: readonly ShapeColorChoice[]
  correctChoiceId: string
}
