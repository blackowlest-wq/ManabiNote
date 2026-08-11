export type ReadingComprehensionChoice = {
  id: string
  text: string
}

export type ReadingComprehensionQuestion = {
  id: string
  passage: string
  prompt: string
  choices: readonly ReadingComprehensionChoice[]
  correctChoiceId: string
}
