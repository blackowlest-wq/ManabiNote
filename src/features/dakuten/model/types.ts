export type DakutenMark = '゛' | '゜'

export type DakutenChoice = {
  id: string
  character: string
}

export type DakutenQuestion = {
  id: string
  baseCharacter: string
  mark: DakutenMark
  answer: string
  choices: readonly DakutenChoice[]
  correctChoiceId: string
}
