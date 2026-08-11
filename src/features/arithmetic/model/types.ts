export type ArithmeticKind = 'addition' | 'subtraction'

export type ArithmeticChoice = {
  id: string
  value: number
}

export type ArithmeticQuestion = {
  id: string
  kind: ArithmeticKind
  left: number
  right: number
  answer: number
  choices: readonly ArithmeticChoice[]
  correctChoiceId: string
}
