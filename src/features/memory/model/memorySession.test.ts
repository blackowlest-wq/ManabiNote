import { describe, expect, it } from 'vitest'
import type { KanaToPictureQuestion } from '../../question-types/kana-to-picture/model/types'
import { createMemorySession, flipMemoryCard, isMemoryComplete } from './memorySession'

const questions: KanaToPictureQuestion[] = ['あ', 'い', 'う', 'え', 'お'].map((kana, index) => ({
  type: 'kana-to-picture',
  id: `question-${index}`,
  kana,
  reading: `${kana}いろ`,
  choices: [
    {
      id: `choice-${index}`,
      label: `${kana}いろ`,
      reading: `${kana}いろ`,
      image: { atlasId: 'test', symbolId: `picture-${index}` },
    },
    {
      id: `other-choice-${index}`,
      label: 'ほか',
      reading: 'ほか',
      image: { atlasId: 'test', symbolId: `other-${index}` },
    },
    {
      id: `third-choice-${index}`,
      label: 'べつ',
      reading: 'べつ',
      image: { atlasId: 'test', symbolId: `third-${index}` },
    },
    {
      id: `fourth-choice-${index}`,
      label: 'もうひとつ',
      reading: 'もうひとつ',
      image: { atlasId: 'test', symbolId: `fourth-${index}` },
    },
  ],
  correctChoiceId: `choice-${index}`,
}))

const createSession = () => createMemorySession(
  questions,
  () => new Date('2026-08-11T14:00:00.000Z'),
  () => 0.999,
)

describe('memory session', () => {
  it('creates four picture and kana pairs as eight cards', () => {
    const session = createSession()

    expect(session.pairs).toHaveLength(4)
    expect(session.cards).toHaveLength(8)
    expect(new Set(session.cards.map((card) => card.id)).size).toBe(8)
    expect(new Set(session.cards.map((card) => card.pairId)).size).toBe(4)
    expect(session.cards.filter((card) => card.kind === 'kana')).toHaveLength(4)
    expect(session.cards.filter((card) => card.kind === 'picture')).toHaveLength(4)
  })

  it('marks a matching kana and picture pair after two flips', () => {
    const session = createSession()
    const pair = session.pairs[0]
    if (!pair) throw new Error('テストペアが見つかりません')
    const kanaCard = session.cards.find((card) => card.pairId === pair.id && card.kind === 'kana')
    const pictureCard = session.cards.find((card) => card.pairId === pair.id && card.kind === 'picture')
    if (!kanaCard || !pictureCard) throw new Error('テストカードが見つかりません')

    const firstFlip = flipMemoryCard(session, kanaCard.id)
    expect(firstFlip.flippedCardIds).toEqual([kanaCard.id])
    expect(firstFlip.moves).toBe(0)

    const matched = flipMemoryCard(firstFlip, pictureCard.id)
    expect(matched.matchedPairIds).toContain(pair.id)
    expect(matched.flippedCardIds).toEqual([])
    expect(matched.feedback).toBe('correct')
    expect(matched.moves).toBe(1)
  })

  it('lets the next card start a new turn after a mismatch', () => {
    const session = createSession()
    const firstCard = session.cards[0]
    const otherCard = session.cards.find((card) => card.pairId !== firstCard?.pairId)
    const nextCard = session.cards.find((card) => card.id !== firstCard?.id && card.id !== otherCard?.id)
    if (!firstCard || !otherCard || !nextCard) throw new Error('テストカードが見つかりません')

    const mismatched = flipMemoryCard(flipMemoryCard(session, firstCard.id), otherCard.id)
    expect(mismatched.feedback).toBe('incorrect')
    expect(mismatched.flippedCardIds).toEqual([firstCard.id, otherCard.id])

    const nextTurn = flipMemoryCard(mismatched, nextCard.id)
    expect(nextTurn.feedback).toBe('none')
    expect(nextTurn.flippedCardIds).toEqual([nextCard.id])
    expect(nextTurn.moves).toBe(1)
  })

  it('becomes complete after all four pairs are matched', () => {
    let session = createSession()

    for (const pair of session.pairs) {
      const kanaCard = session.cards.find((card) => card.pairId === pair.id && card.kind === 'kana')
      const pictureCard = session.cards.find((card) => card.pairId === pair.id && card.kind === 'picture')
      if (!kanaCard || !pictureCard) throw new Error('テストカードが見つかりません')
      session = flipMemoryCard(flipMemoryCard(session, kanaCard.id), pictureCard.id)
    }

    expect(isMemoryComplete(session)).toBe(true)
    expect(session.matchedPairIds).toHaveLength(4)
    expect(session.status).toBe('complete')
  })
})
