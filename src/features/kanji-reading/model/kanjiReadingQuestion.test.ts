import { describe, expect, it } from 'vitest'
import { createKanjiReadingQuestions } from './kanjiReadingQuestion'

describe('createKanjiReadingQuestions', () => {
  it('creates shuffled reading choices for each kanji', () => {
    const questions = createKanjiReadingQuestions(() => 0.999)

    expect(questions.length).toBeGreaterThanOrEqual(10)
    for (const question of questions) {
      expect(question.kanji).toHaveLength(1)
      expect(question.word).toContain(question.kanji)
      expect(question.choices).toHaveLength(4)
      expect(question.choices.map((choice) => choice.reading)).toContain(question.answer)
      expect(question.choices.find((choice) => choice.id === question.correctChoiceId)?.reading).toBe(question.answer)
    }
  })

  it('does not include another valid reading of 日 as an incorrect choice', () => {
    const question = createKanjiReadingQuestions(() => 0.999).find((candidate) => candidate.kanji === '日')

    expect(question).toBeDefined()
    expect(question?.answer).toBe('ひ')
    expect(question?.choices.map((choice) => choice.reading)).not.toContain('にち')
  })
})
