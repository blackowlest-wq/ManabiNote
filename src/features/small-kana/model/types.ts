export type SmallKanaChoice = {
  id: string
  character: string
}

export type SmallKanaQuestion = {
  id: string
  word: string
  answer: string
  choices: readonly SmallKanaChoice[]
  correctChoiceId: string
}
