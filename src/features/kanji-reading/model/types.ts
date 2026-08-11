export type KanjiReadingChoice = {
  id: string
  reading: string
}

export type KanjiReadingQuestion = {
  id: string
  kanji: string
  word: string
  answer: string
  choices: readonly KanjiReadingChoice[]
  correctChoiceId: string
}
