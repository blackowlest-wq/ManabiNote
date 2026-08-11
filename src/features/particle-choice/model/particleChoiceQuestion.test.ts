import { describe, expect, it } from 'vitest'
import { createParticleChoiceQuestions, getMaskedParticleSentence } from './particleChoiceQuestion'

describe('createParticleChoiceQuestions', () => {
  it('creates four shuffled particle choices for each sentence', () => {
    const questions = createParticleChoiceQuestions(() => 0.999)

    expect(questions.length).toBeGreaterThanOrEqual(10)
    for (const question of questions) {
      expect(question.choices).toHaveLength(4)
      expect(new Set(question.choices.map((choice) => choice.particle)).size).toBe(4)
      expect(question.choices.find((choice) => choice.id === question.correctChoiceId)?.particle).toBe(question.answer)
      expect(getMaskedParticleSentence(question)).toBe(`${question.before} ＿ ${question.after}`)
    }
  })
})
