import { describe, expect, it } from 'vitest'
import { createKanjiChoiceQuestions } from './kanjiChoiceQuestion'

describe('createKanjiChoiceQuestions', () => {
  it('covers all eighty first-grade kanji', () => {
    const firstGradeKanji = [...'一右雨円王音下火花貝学気九休玉金空月犬見五口校左三山子四糸字耳七車手十出女小上森人水正生青夕石赤千川先早草足村大男竹中虫町天田土二日入年白八百文木本名目立力林六']
    const questions = createKanjiChoiceQuestions(() => 0.999)

    expect(questions).toHaveLength(80)
    expect(new Set(questions.map((question) => question.answer))).toEqual(new Set(firstGradeKanji))
  })

  it('offers only one valid kanji for every shown reading', () => {
    const questions = createKanjiChoiceQuestions(() => 0.999)

    for (const question of questions) {
      const otherAnswersWithSameReading = questions
        .filter((candidate) => candidate.reading === question.reading && candidate.answer !== question.answer)
        .map((candidate) => candidate.answer)

      const ambiguousChoices = question.choices
        .map((choice) => choice.kanji)
        .filter((choice) => otherAnswersWithSameReading.includes(choice))

      expect(ambiguousChoices).toEqual([])
    }
  })

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
