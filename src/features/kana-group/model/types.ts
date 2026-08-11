export type KanaGroupChoice = {
  id: string
  label: string
}

export type KanaGroupQuestion = {
  id: string
  targetCharacter: string
  groupId: string
  choices: readonly KanaGroupChoice[]
  correctChoiceId: string
}
