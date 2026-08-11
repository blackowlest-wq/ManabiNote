export type NumberOrderChoice = {
  id: string
  value: number
}

export type NumberOrderQuestion = {
  id: string
  sequence: readonly (number | null)[]
  answer: number
  choices: readonly NumberOrderChoice[]
  correctChoiceId: string
}
