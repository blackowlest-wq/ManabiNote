import type { PictureImageRef } from '../../question-types/kana-to-picture/model/imageAtlas'

export type ShiritoriChoice = {
  id: string
  label: string
  reading: string
  image: PictureImageRef
}

export type ShiritoriQuestion = {
  id: string
  previousWord: string
  previousReading: string
  previousImage: PictureImageRef
  choices: readonly ShiritoriChoice[]
  correctChoiceId: string
}
