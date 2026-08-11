export type ParticleChoiceOption = {
  id: string
  particle: string
}

export type ParticleChoiceQuestion = {
  id: string
  before: string
  after: string
  answer: string
  choices: readonly ParticleChoiceOption[]
  correctChoiceId: string
}
