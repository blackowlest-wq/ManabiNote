import { describe, expect, it } from 'vitest'
import type { KanaToPictureQuestion } from '../../question-types/kana-to-picture/model/types'
import type { WordBuilderQuestion } from './types'
import { adaptWordBuilderQuestions, createWordTiles } from './wordBuilderQuestion'

const makeKanaQuestion = (reading: string): KanaToPictureQuestion => ({
  type: 'kana-to-picture',
  id: `q-${reading}`,
  kana: Array.from(reading)[0] ?? 'あ',
  reading,
  choices: [
    { id: 'correct', label: reading, reading, image: { atlasId: 'food-01', symbolId: 'apple' } },
    { id: 'wrong', label: 'ねこ', reading: 'ねこ', image: { atlasId: 'animals-01', symbolId: 'cat' } },
  ],
  correctChoiceId: 'correct',
})

const makeWordQuestion = (reading: string): WordBuilderQuestion => ({
  id: `word-${reading}`,
  reading,
  image: { atlasId: 'food-01', symbolId: 'apple' },
})

describe('word builder question model', () => {
  it('uses the correct choice image and reading', () => {
    const result = adaptWordBuilderQuestions([makeKanaQuestion('りんご')])

    expect(result).toEqual([{
      id: 'q-りんご',
      reading: 'りんご',
      image: { atlasId: 'food-01', symbolId: 'apple' },
    }])
  })

  it('creates one tile per character including ー', () => {
    const tiles = createWordTiles(makeWordQuestion('けーき'), () => 0.999)

    expect(tiles).toHaveLength(3)
    expect(tiles.map((tile) => tile.character).sort()).toEqual(['き', 'け', 'ー'])
    expect(new Set(tiles.map((tile) => tile.id)).size).toBe(3)
  })

  it('keeps duplicate characters as separate tiles', () => {
    const tiles = createWordTiles(makeWordQuestion('ばなな'), () => 0.999)

    expect(tiles.filter((tile) => tile.character === 'な')).toHaveLength(2)
  })
})
