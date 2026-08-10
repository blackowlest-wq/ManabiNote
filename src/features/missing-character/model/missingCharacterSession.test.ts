import { describe, expect, it } from 'vitest'
import type { MissingCharacterQuestion } from './types'
import {
  createMissingCharacterSession,
  isMissingCharacterComplete,
  nextMissingCharacterQuestion,
  selectChoice,
} from './missingCharacterSession'

const makeQuestion = (index: number, reading: string): MissingCharacterQuestion => ({
  id: `missing-${index}`,
  reading,
  image: { atlasId: 'food-01', symbolId: 'apple' },
  missingIndex: 0,
  correctCharacter: Array.from(reading)[0] ?? 'あ',
  choices: [
    { id: `missing-${index}-correct`, character: Array.from(reading)[0] ?? 'あ' },
    { id: `missing-${index}-wrong-1`, character: 'い' },
    { id: `missing-${index}-wrong-2`, character: 'う' },
    { id: `missing-${index}-wrong-3`, character: 'え' },
  ],
  correctChoiceId: `missing-${index}-correct`,
})

const makeQuestions = (): MissingCharacterQuestion[] => [
  makeQuestion(0, 'りんご'),
  makeQuestion(1, 'ねこ'),
  makeQuestion(2, 'いぬ'),
  makeQuestion(3, 'うし'),
  makeQuestion(4, 'くま'),
  makeQuestion(5, 'さる'),
]

const fixedNow = () => new Date('2026-08-11T10:00:00.000Z')

describe('missing character session', () => {
  it('starts with five unique questions and no selected answer', () => {
    const session = createMissingCharacterSession(makeQuestions(), fixedNow, () => 0.999)

    expect(session.questions).toHaveLength(5)
    expect(new Set(session.questions.map((question) => question.id)).size).toBe(5)
    expect(session.currentIndex).toBe(0)
    expect(session.selectedChoiceId).toBeNull()
    expect(session.feedback).toBe('none')
  })

  it('keeps an incorrect answer retryable and marks the correct answer', () => {
    const session = createMissingCharacterSession(makeQuestions(), fixedNow, () => 0.999)
    const question = session.questions[0]
    if (!question) throw new Error('テスト問題が見つかりません')

    const wrongChoice = question.choices.find((choice) => choice.id !== question.correctChoiceId)
    if (!wrongChoice) throw new Error('不正解の選択肢が見つかりません')

    const incorrect = selectChoice(session, wrongChoice.id)
    expect(incorrect.feedback).toBe('incorrect')
    expect(incorrect.currentIndex).toBe(0)

    const correct = selectChoice(incorrect, question.correctChoiceId)
    expect(correct.feedback).toBe('correct')
    expect(correct.selectedChoiceId).toBe(question.correctChoiceId)
  })

  it('advances only after a correct answer and completes after five questions', () => {
    let session = createMissingCharacterSession(makeQuestions(), fixedNow, () => 0.999)

    for (let index = 0; index < 5; index += 1) {
      const question = session.questions[session.currentIndex]
      if (!question) throw new Error('テスト問題が見つかりません')
      session = nextMissingCharacterQuestion(selectChoice(session, question.correctChoiceId))
    }

    expect(isMissingCharacterComplete(session)).toBe(true)
    expect(session.currentIndex).toBe(5)
  })
})
