import { describe, expect, it } from 'vitest'
import { createSentenceOrderQuestions } from './sentenceOrderQuestion'

describe('createSentenceOrderQuestions', () => {
  it.each([
    ['easy', 2, 2],
    ['normal', 3, 3],
    ['hard', 4, 5],
  ] as const)('%sの文を難易度に合う長さで作る', (difficulty, minimumWords, maximumWords) => {
    const questions = createSentenceOrderQuestions(difficulty, () => 0)

    expect(questions.length).toBeGreaterThanOrEqual(7)
    expect(questions.every((question) => (
      question.words.length >= minimumWords && question.words.length <= maximumWords
    ))).toBe(true)
  })

  it('creates shuffled word choices and a known answer order', () => {
    const questions = createSentenceOrderQuestions('normal', () => 0)

    expect(questions[0]).toMatchObject({
      id: 'sentence-order-ringo',
      sentence: 'わたしは りんごを たべます',
      words: ['わたしは', 'りんごを', 'たべます'],
    })
    expect(questions[0]?.choices.map((choice) => choice.word)).toEqual(['りんごを', 'たべます', 'わたしは'])
    expect(questions[0]?.correctChoiceIds).toHaveLength(3)
  })
})
