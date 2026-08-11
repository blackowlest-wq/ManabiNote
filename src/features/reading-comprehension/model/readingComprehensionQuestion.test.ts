import { describe, expect, it } from 'vitest'
import { createReadingComprehensionQuestions } from './readingComprehensionQuestion'

describe('createReadingComprehensionQuestions', () => {
  it.each(['easy', 'normal', 'hard'] as const)('%sの読解問題を7問以上作る', (difficulty) => {
    const questions = createReadingComprehensionQuestions(difficulty, () => 0.999)

    expect(questions.length).toBeGreaterThanOrEqual(7)
    for (const question of questions) {
      expect(question.choices).toHaveLength(4)
      expect(new Set(question.choices.map((choice) => choice.text)).size).toBe(4)
      expect(question.choices.some((choice) => choice.id === question.correctChoiceId)).toBe(true)
    }
  })

  it('むずかしい問題では理由や順序をたずねる', () => {
    const prompts = createReadingComprehensionQuestions('hard', () => 0.999).map((question) => question.prompt)

    expect(prompts.some((prompt) => prompt.includes('どうして'))).toBe(true)
    expect(prompts.some((prompt) => prompt.includes('まえに'))).toBe(true)
  })
})
