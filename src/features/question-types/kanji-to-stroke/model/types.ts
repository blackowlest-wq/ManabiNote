import type {
  StrokeDefinition,
  StrokePoint,
  StrokeQuestionGeometry,
} from '../../../stroke-order/model/strokeTypes'
import type { FirstGradeKanji } from './kanjiCharacters'

export type { StrokeDefinition, StrokePoint } from '../../../stroke-order/model/strokeTypes'
export type { FirstGradeKanji } from './kanjiCharacters'

export type KanjiToStrokeQuestion = StrokeQuestionGeometry & {
  type: 'kanji-to-stroke'
  id: string
  kanji: FirstGradeKanji
}
