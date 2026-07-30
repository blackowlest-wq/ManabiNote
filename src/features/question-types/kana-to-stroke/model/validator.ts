import { STROKE_KANA, type KanaToStrokeQuestion, type StrokeDefinition, type StrokeKana, type StrokePoint } from './types'

export type StrokeDataErrorCode = 'INVALID_STROKE_DATA'

export class StrokeDataError extends Error {
  readonly code: StrokeDataErrorCode

  constructor(message = '問題データを読み込めませんでした。', code: StrokeDataErrorCode = 'INVALID_STROKE_DATA') {
    super(message)
    this.name = 'StrokeDataError'
    this.code = code
  }
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value)

const isNonEmptyString = (value: unknown): value is string =>
  typeof value === 'string' && value.trim().length > 0

const isFiniteNumber = (value: unknown): value is number =>
  typeof value === 'number' && Number.isFinite(value)

const invalidData = (): never => {
  throw new StrokeDataError()
}

const validatePoint = (raw: unknown): StrokePoint => {
  if (
    !isRecord(raw) ||
    !isFiniteNumber(raw.x) ||
    !isFiniteNumber(raw.y) ||
    raw.x < 0 ||
    raw.x > 200 ||
    raw.y < 0 ||
    raw.y > 200
  ) {
    return invalidData()
  }

  return { x: raw.x, y: raw.y }
}

const validateStroke = (raw: unknown, expectedOrder: number): StrokeDefinition => {
  if (
    !isRecord(raw) ||
    raw.order !== expectedOrder ||
    !isNonEmptyString(raw.guidePath) ||
    !Array.isArray(raw.checkpoints) ||
    raw.checkpoints.length < 2
  ) {
    return invalidData()
  }

  return {
    order: expectedOrder,
    guidePath: raw.guidePath,
    checkpoints: raw.checkpoints.map(validatePoint),
  }
}

const validateQuestion = (raw: unknown, expectedKana: StrokeKana): KanaToStrokeQuestion => {
  if (
    !isRecord(raw) ||
    raw.type !== 'kana-to-stroke' ||
    !isNonEmptyString(raw.id) ||
    raw.kana !== expectedKana ||
    raw.viewBox !== '0 0 200 200' ||
    !Array.isArray(raw.strokes) ||
    raw.strokes.length < 1
  ) {
    return invalidData()
  }

  return {
    type: 'kana-to-stroke',
    id: raw.id,
    kana: expectedKana,
    viewBox: '0 0 200 200',
    strokes: raw.strokes.map((stroke, index) => validateStroke(stroke, index + 1)),
  }
}

export const validateStrokeQuestions = (raw: unknown): KanaToStrokeQuestion[] => {
  if (!Array.isArray(raw) || raw.length !== STROKE_KANA.length) {
    return invalidData()
  }

  const questions = raw.map((question, index) => validateQuestion(question, STROKE_KANA[index]))
  const questionIds = questions.map((question) => question.id)
  if (new Set(questionIds).size !== questionIds.length) {
    return invalidData()
  }

  return questions
}
