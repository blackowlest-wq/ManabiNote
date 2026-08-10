import type { PictureImageRef } from '../../question-types/kana-to-picture/model/imageAtlas'

export type MissingCharacterChoice = {
  id: string
  character: string
}

export type MissingCharacterQuestion = {
  id: string
  reading: string
  image: PictureImageRef
  missingIndex: number
  correctCharacter: string
  choices: readonly MissingCharacterChoice[]
  correctChoiceId: string
}
