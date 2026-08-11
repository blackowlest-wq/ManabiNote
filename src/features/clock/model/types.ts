export type ClockTime = {
  hour: number
  minute: number
}

export type ClockChoice = ClockTime & {
  id: string
  label: string
}

export type ClockQuestion = ClockTime & {
  id: string
  choices: readonly ClockChoice[]
  correctChoiceId: string
}
