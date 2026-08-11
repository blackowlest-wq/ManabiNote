import { describe, expect, it } from 'vitest'
import { createKanjiChoiceQuestions } from './kanjiChoiceQuestion'

describe('createKanjiChoiceQuestions', () => {
  it('creates four shuffled kanji choices for each reading', () => {
    const questions = createKanjiChoiceQuestions(() => 0.999)

    expect(questions.length).toBeGreaterThanOrEqual(10)
    for (const question of questions) {
      expect(question.choices).toHaveLength(4)
      expect(new Set(question.choices.map((choice) => choice.kanji)).size).toBe(4)
      expect(question.choices.find((choice) => choice.id === question.correctChoiceId)?.kanji).toBe(question.answer)
    }
  })
})
