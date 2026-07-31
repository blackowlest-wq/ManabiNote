import rawQuestions from '../data/strokes.json'
import { getStrokeRow, type StrokeRowId } from './kanaRows'
import type { KanaToStrokeQuestion } from './types'
import { validateStrokeQuestions } from './validator'

const validatedQuestions = validateStrokeQuestions(rawQuestions)

export const loadStrokeQuestions = (): KanaToStrokeQuestion[] => validatedQuestions

export const loadStrokeQuestionsForRow = (rowId: StrokeRowId): KanaToStrokeQuestion[] => {
  const rowQuestionMap = new Map(loadStrokeQuestions().map((question) => [question.kana, question]))
  return getStrokeRow(rowId).kana
    .map((kana) => rowQuestionMap.get(kana))
    .filter((question): question is KanaToStrokeQuestion => question !== undefined)
}
