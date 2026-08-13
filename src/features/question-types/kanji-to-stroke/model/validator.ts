import { StrokeDataError } from '../../kana-to-stroke/model/validator'
import { FIRST_GRADE_KANJI, type FirstGradeKanji } from './kanjiCharacters'
import type { KanjiToStrokeQuestion, StrokeDefinition, StrokePoint } from './types'

export { StrokeDataError }

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

const validateGlyphPaths = (raw: unknown, expectedCount: number): readonly string[] => {
  if (
    !Array.isArray(raw) ||
    raw.length !== expectedCount ||
    raw.some((path) => !isNonEmptyString(path))
  ) {
    return invalidData()
  }

  return raw
}

const validateQuestion = (raw: unknown, expectedKanji: FirstGradeKanji): KanjiToStrokeQuestion => {
  if (
    !isRecord(raw) ||
    raw.type !== 'kanji-to-stroke' ||
    !isNonEmptyString(raw.id) ||
    raw.kanji !== expectedKanji ||
    raw.viewBox !== '0 0 200 200' ||
    !Array.isArray(raw.strokes) ||
    raw.strokes.length < 1 ||
    !Array.isArray(raw.glyphPaths) ||
    raw.glyphPaths.length !== raw.strokes.length
  ) {
    return invalidData()
  }

  return {
    type: 'kanji-to-stroke',
    id: raw.id,
    kanji: expectedKanji,
    viewBox: '0 0 200 200',
    glyphPaths: validateGlyphPaths(raw.glyphPaths, raw.strokes.length),
    strokes: raw.strokes.map((stroke, index) => validateStroke(stroke, index + 1)),
  }
}

export const validateKanjiStrokeQuestions = (raw: unknown): KanjiToStrokeQuestion[] => {
  if (!Array.isArray(raw) || raw.length !== FIRST_GRADE_KANJI.length) {
    return invalidData()
  }

  const questions = raw.map((question, index) => validateQuestion(question, FIRST_GRADE_KANJI[index]))
  const questionIds = questions.map((question) => question.id)
  if (new Set(questionIds).size !== questionIds.length) {
    return invalidData()
  }

  return questions
}
