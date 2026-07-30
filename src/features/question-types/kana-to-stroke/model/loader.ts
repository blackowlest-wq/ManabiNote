import rawQuestions from '../data/strokes.json'
import type { KanaToStrokeQuestion } from './types'
import { validateStrokeQuestions } from './validator'

const validatedQuestions = validateStrokeQuestions(rawQuestions)

export const loadStrokeQuestions = (): KanaToStrokeQuestion[] => validatedQuestions
