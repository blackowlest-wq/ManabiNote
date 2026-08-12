import { describe, expect, it } from 'vitest'
import { createKanjiReadingQuestions } from './kanjiReadingQuestion'

describe('createKanjiReadingQuestions', () => {
  it('covers all eighty first-grade kanji', () => {
    const firstGradeKanji = [...'一右雨円王音下火花貝学気九休玉金空月犬見五口校左三山子四糸字耳七車手十出女小上森人水正生青夕石赤千川先早草足村大男竹中虫町天田土二日入年白八百文木本名目立力林六']
    const questions = createKanjiReadingQuestions(() => 0.999)

    expect(questions).toHaveLength(80)
    expect(new Set(questions.map((question) => question.kanji))).toEqual(new Set(firstGradeKanji))
  })

  it('creates shuffled reading choices for each kanji', () => {
    const questions = createKanjiReadingQuestions(() => 0.999)

    expect(questions.length).toBeGreaterThanOrEqual(10)
    for (const question of questions) {
      expect(question.kanji).toHaveLength(1)
      expect(question.word).toContain(question.kanji)
      expect(question.choices).toHaveLength(4)
      expect(new Set(question.choices.map((choice) => choice.reading))).toHaveProperty('size', 4)
      expect(question.choices.map((choice) => choice.reading)).toContain(question.answer)
      expect(question.choices.find((choice) => choice.id === question.correctChoiceId)?.reading).toBe(question.answer)
    }
  })

  it('uses a word to give 日 one unambiguous reading', () => {
    const question = createKanjiReadingQuestions(() => 0.999).find((candidate) => candidate.kanji === '日')

    expect(question).toBeDefined()
    expect(question?.word).toBe('日なた')
    expect(question?.answer).toBe('ひなた')
    expect(question?.choices.map((choice) => choice.reading)).not.toContain('にち')
  })
})
