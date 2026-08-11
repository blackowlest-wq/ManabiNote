import type { PictureImageRef } from '../../question-types/kana-to-picture/model/imageAtlas'

export type MemoryPair = {
  id: string
  kana: string
  word: string
  image: PictureImageRef
}

export type MemoryKanaCard = {
  id: string
  pairId: string
  kind: 'kana'
  character: string
}

export type MemoryPictureCard = {
  id: string
  pairId: string
  kind: 'picture'
  label: string
  image: PictureImageRef
}

export type MemoryCard = MemoryKanaCard | MemoryPictureCard
