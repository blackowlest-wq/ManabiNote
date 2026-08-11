import { describe, expect, it } from 'vitest'
import { createSentenceOrderQuestions } from './sentenceOrderQuestion'

describe('createSentenceOrderQuestions', () => {
  it('creates sentence questions with shuffled word choices and a known answer order', () => {
    const questions = createSentenceOrderQuestions(() => 0)

    expect(questions.length).toBeGreaterThanOrEqual(5)
    expect(questions[0]).toMatchObject({
      id: 'sentence-order-ringo',
      sentence: 'わたしは りんごを たべます',
      words: ['わたしは', 'りんごを', 'たべます'],
    })
    expect(questions[0]?.choices.map((choice) => choice.word)).toEqual(['りんごを', 'たべます', 'わたしは'])
    expect(questions[0]?.correctChoiceIds).toHaveLength(3)
  })
})
