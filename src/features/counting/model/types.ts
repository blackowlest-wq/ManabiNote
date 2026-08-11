import type { PictureImageRef } from '../../question-types/kana-to-picture/model/imageAtlas'

export type CountingChoice = {
  id: string
  count: number
}

export type CountingQuestion = {
  id: string
  label: string
  image: PictureImageRef
  count: number
  choices: readonly CountingChoice[]
  correctChoiceId: string
}
