export type NumberCompareSide = 'left' | 'right'

export type NumberCompareChoice = {
  id: string
  side: NumberCompareSide
  value: number
}

export type NumberCompareQuestion = {
  id: string
  left: number
  right: number
  choices: readonly NumberCompareChoice[]
  correctChoiceId: string
}
