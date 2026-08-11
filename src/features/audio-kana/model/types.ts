export type AudioKanaChoice = {
  id: string
  character: string
}

export type AudioKanaQuestion = {
  id: string
  answer: string
  choices: readonly AudioKanaChoice[]
  correctChoiceId: string
}
