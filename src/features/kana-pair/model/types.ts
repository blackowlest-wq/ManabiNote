export type KanaPairChoice = {
  id: string
  character: string
}

export type KanaPairQuestion = {
  id: string
  hiragana: string
  katakana: string
  choices: readonly KanaPairChoice[]
  correctChoiceId: string
}
