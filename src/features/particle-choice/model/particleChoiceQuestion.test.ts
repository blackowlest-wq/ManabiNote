import { describe, expect, it } from 'vitest'
import { createParticleChoiceQuestions, getMaskedParticleSentence } from './particleChoiceQuestion'

describe('createParticleChoiceQuestions', () => {
  it.each(['easy', 'normal', 'hard'] as const)('%sのつなぐことばを7問以上作る', (difficulty) => {
    const questions = createParticleChoiceQuestions(difficulty, () => 0.999)

    expect(questions.length).toBeGreaterThanOrEqual(7)
    for (const question of questions) {
      expect(question.choices).toHaveLength(4)
      expect(new Set(question.choices.map((choice) => choice.particle)).size).toBe(4)
      expect(question.choices.find((choice) => choice.id === question.correctChoiceId)?.particle).toBe(question.answer)
      expect(getMaskedParticleSentence(question)).toBe(`${question.before} ＿ ${question.after}`)
    }
  })

  it('むずかしい問題には文をつなぐ表現が含まれる', () => {
    const questions = createParticleChoiceQuestions('hard', () => 0.999)

    expect(questions.map((question) => question.answer)).toEqual(expect.arrayContaining(['ので', 'から', 'ながら']))
  })
})
