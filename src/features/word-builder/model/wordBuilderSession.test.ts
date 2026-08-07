import { describe, expect, it } from 'vitest'
import type { WordBuilderQuestion } from './types'
import {
  createWordBuilderSession,
  isWordBuilderComplete,
  nextWord,
  selectTile,
  submitWord,
  undoLastTile,
} from './wordBuilderSession'

const makeQuestion = (index: number, reading: string): WordBuilderQuestion => ({
  id: `word-${index}-${reading}`,
  reading,
  image: { atlasId: 'food-01', symbolId: 'apple' },
})

const makeQuestions = (firstReading = 'りんご'): WordBuilderQuestion[] => [
  makeQuestion(0, firstReading),
  makeQuestion(1, 'ねこ'),
  makeQuestion(2, 'いぬ'),
  makeQuestion(3, 'うし'),
  makeQuestion(4, 'くま'),
  makeQuestion(5, 'さる'),
]

const fixedNow = () => new Date('2026-08-07T11:00:00.000Z')

const createSessionFor = (reading: string) =>
  createWordBuilderSession(makeQuestions(reading), fixedNow, () => 0.999)

const tileIdFor = (session: ReturnType<typeof createSessionFor>, character: string) => {
  const tile = session.tiles.find((candidate) => candidate.character === character)
  if (!tile) throw new Error(`タイルが見つかりません: ${character}`)
  return tile.id
}

const selectCharacters = (
  session: ReturnType<typeof createSessionFor>,
  characters: string[],
) => characters.reduce((current, character) => selectTile(current, tileIdFor(current, character)), session)

describe('word builder session', () => {
  it('creates five unique questions and initializes the first tile set', () => {
    const session = createWordBuilderSession(makeQuestions(), fixedNow, () => 0.999)

    expect(session.questions).toHaveLength(5)
    expect(new Set(session.questions.map((question) => question.id)).size).toBe(5)
    expect(session.currentIndex).toBe(0)
    expect(session.selectedTileIds).toEqual([])
    expect(session.feedback).toBe('none')
    expect(session.tiles).not.toHaveLength(0)
  })

  it('accepts either duplicate tile when the character sequence is correct', () => {
    const session = createSessionFor('ばなな')
    const bananaTiles = session.tiles.filter((tile) => tile.character === 'な')
    let selected = selectTile(session, tileIdFor(session, 'ば'))
    selected = selectTile(selected, bananaTiles[1].id)
    selected = selectTile(selected, bananaTiles[0].id)

    expect(submitWord(selected).feedback).toBe('correct')
  })

  it('keeps the same question after an incorrect submission and undo resets feedback', () => {
    const session = createSessionFor('りんご')
    const submitted = submitWord(selectCharacters(session, ['ご', 'り', 'ん']))

    expect(submitted.feedback).toBe('incorrect')
    expect(submitted.currentIndex).toBe(0)

    const undone = undoLastTile(submitted)
    expect(undone.selectedTileIds).toHaveLength(submitted.selectedTileIds.length - 1)
    expect(undone.feedback).toBe('none')
  })

  it('advances after a correct word and completes after the fifth word', () => {
    let session = createSessionFor('りんご')

    for (let index = 0; index < 5; index += 1) {
      const reading = session.questions[session.currentIndex]?.reading
      if (!reading) throw new Error('現在の問題が見つかりません')
      session = nextWord(submitWord(selectCharacters(session, Array.from(reading))))
    }

    expect(isWordBuilderComplete(session)).toBe(true)
    expect(session.currentIndex).toBe(5)
  })
})
