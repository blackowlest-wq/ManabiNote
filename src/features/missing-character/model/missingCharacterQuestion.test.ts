import { describe, expect, it } from 'vitest'
import type { MissingCharacterQuestion } from './types'
import { adaptMissingCharacterQuestions, createMissingCharacterQuestion, getMaskedReading } from './missingCharacterQuestion'
import type { KanaToPictureQuestion } from '../../question-types/kana-to-picture/model/types'

const source = {
  id: 'word-りんご',
  reading: 'りんご',
  image: { atlasId: 'food-01', symbolId: 'apple' },
}

const kanaQuestion: KanaToPictureQuestion = {
  type: 'kana-to-picture',
  id: 'hiragana-091',
  kana: 'り',
  reading: 'りんご',
  choices: [
    { id: 'correct', label: 'りんご', reading: 'りんご', image: { atlasId: 'food-01', symbolId: 'apple' } },
    { id: 'wrong', label: 'ねこ', reading: 'ねこ', image: { atlasId: 'animals-01', symbolId: 'cat' } },
  ],
  correctChoiceId: 'correct',
}

describe('missing character question model', () => {
  it('creates a masked word with the correct character among four choices', () => {
    const question = createMissingCharacterQuestion(source, () => 0)

    expect(question.missingIndex).toBe(0)
    expect(question.correctCharacter).toBe('り')
    expect(getMaskedReading(question)).toBe('＿んご')
    expect(question.choices).toHaveLength(4)
    expect(question.choices.map((choice) => choice.character)).toContain('り')
    expect(question.choices.find((choice) => choice.id === question.correctChoiceId)?.character).toBe('り')
  })

  it('keeps duplicated characters valid when the missing position is selected', () => {
    const question = createMissingCharacterQuestion({ ...source, id: 'word-ばなな', reading: 'ばなな' }, () => 0.5)

    expect(question.missingIndex).toBe(1)
    expect(question.correctCharacter).toBe('な')
    expect(getMaskedReading(question)).toBe('ば＿な')
  })

  it('adapts the correct picture choice from the existing question bank', () => {
    const questions = adaptMissingCharacterQuestions([kanaQuestion], () => 0.999)

    expect(questions[0]).toMatchObject<Partial<MissingCharacterQuestion>>({
      id: 'hiragana-091',
      reading: 'りんご',
      image: { atlasId: 'food-01', symbolId: 'apple' },
      missingIndex: 2,
      correctCharacter: 'ご',
    })
  })
})
