export type KanjiChoiceOption = {
  id: string
  kanji: string
}

export type KanjiChoiceQuestion = {
  id: string
  reading: string
  answer: string
  choices: readonly KanjiChoiceOption[]
  correctChoiceId: string
}
