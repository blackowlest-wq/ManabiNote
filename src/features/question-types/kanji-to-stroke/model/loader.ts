import rawQuestions from '../data/strokes.json'
import { validateKanjiStrokeQuestions } from './validator'
import type { KanjiToStrokeQuestion } from './types'

const validatedQuestions = validateKanjiStrokeQuestions(rawQuestions)

export const loadKanjiStrokeQuestions = (): KanjiToStrokeQuestion[] => validatedQuestions
