export type SentenceOrderChoice = {
  id: string
  word: string
}

export type SentenceOrderQuestion = {
  id: string
  sentence: string
  words: readonly string[]
  choices: readonly SentenceOrderChoice[]
  correctChoiceIds: readonly string[]
}
