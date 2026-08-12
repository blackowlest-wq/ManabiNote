import { describe, expect, it } from 'vitest'
import { loadKanjiStrokeQuestions } from './loader'
import { createStrokeRegion, recognizeStrokeRegion } from '../../kana-to-stroke/model/strokeRegionRecognizer'

describe('kanji stroke regions', () => {
  it('recognizes every generated kanji stroke from its own visible outline', () => {
    for (const question of loadKanjiStrokeQuestions()) {
      question.strokes.forEach((stroke, index) => {
        const region = createStrokeRegion(stroke, question.glyphPaths[index])
        const recognition = recognizeStrokeRegion(stroke.checkpoints, region)

        expect(recognition, `${question.kanji} ${index + 1}画目 ${JSON.stringify(recognition)}`)
          .toMatchObject({ accepted: true, progress: 1 })
      })
    }
  })
})
