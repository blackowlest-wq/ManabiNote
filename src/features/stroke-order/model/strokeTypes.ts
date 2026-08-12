export type StrokePoint = {
  x: number
  y: number
}

export type StrokeDefinition = {
  order: number
  guidePath: string
  checkpoints: readonly StrokePoint[]
}

export type StrokeQuestionGeometry = {
  viewBox: '0 0 200 200'
  glyphPaths: readonly string[]
  strokes: readonly StrokeDefinition[]
}
