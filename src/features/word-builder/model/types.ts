import type { PictureImageRef } from '../../question-types/kana-to-picture/model/imageAtlas'

export type WordBuilderQuestion = {
  id: string
  reading: string
  image: PictureImageRef
}

export type WordTile = {
  id: string
  character: string
}
