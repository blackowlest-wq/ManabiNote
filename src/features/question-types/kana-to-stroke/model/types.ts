import type { StrokeKana } from './kanaRows'

export type { StrokeKana } from './kanaRows'

export type StrokePoint = {
  x: number
  y: number
}

export type StrokeDefinition = {
  order: number
  guidePath: string
  checkpoints: readonly StrokePoint[]
}

export type KanaToStrokeQuestion = {
  type: 'kana-to-stroke'
  id: string
  kana: StrokeKana
  viewBox: '0 0 200 200'
  strokes: readonly StrokeDefinition[]
}
