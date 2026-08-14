import { describe, expect, it } from 'vitest'
import {
  applyProverbChoiceAction,
  findProverb,
  PROVERB_CHOICE_ROUND_COUNT,
  startProverbChoice,
} from './proverbChoice'
import { PROVERBS } from '../data/proverbs'

const alwaysFirst = () => 0

describe('proverbChoice', () => {
  it('starts ten questions from a proverb pool with four choices each', () => {
    const state = startProverbChoice(alwaysFirst)

    expect(PROVERBS).toHaveLength(20)
    expect(state.journeyProverbIds).toHaveLength(PROVERB_CHOICE_ROUND_COUNT)
    expect(new Set(state.journeyProverbIds).size).toBe(PROVERB_CHOICE_ROUND_COUNT)
    expect(state.question.choiceProverbIds).toHaveLength(4)
    expect(new Set(state.question.choiceProverbIds).size).toBe(4)
    expect(state.question.choiceProverbIds).toContain(state.question.proverbId)
    expect(findProverb(state.question.proverbId)?.explanation).toBeTruthy()
  })

  it('keeps the question open after a wrong answer and builds a combo after a correct answer', () => {
    const state = startProverbChoice(alwaysFirst)
    const wrongProverbId = state.question.choiceProverbIds.find((id) => id !== state.question.proverbId)
    if (!wrongProverbId) throw new Error('不正解の選択肢がありません')

    const missed = applyProverbChoiceAction(state, { type: 'choose', proverbId: wrongProverbId }, alwaysFirst)
    expect(missed.state.status).toBe('playing')
    expect(missed.state.combo).toBe(0)
    expect(missed.state.wrongCount).toBe(1)
    expect(missed.events).toContainEqual({ type: 'proverb-missed', proverbId: wrongProverbId })

    const found = applyProverbChoiceAction(missed.state, { type: 'choose', proverbId: state.question.proverbId }, alwaysFirst)
    expect(found.state.status).toBe('round-won')
    expect(found.state.score).toBe(100)
    expect(found.state.combo).toBe(1)
  })

  it('finishes after all ten proverbs are answered', () => {
    let state = startProverbChoice(alwaysFirst)

    for (let round = 0; round < PROVERB_CHOICE_ROUND_COUNT; round += 1) {
      state = applyProverbChoiceAction(state, { type: 'choose', proverbId: state.question.proverbId }, alwaysFirst).state
      state = applyProverbChoiceAction(state, { type: 'next' }, alwaysFirst).state
    }

    expect(state.status).toBe('finished')
    expect(state.correctCount).toBe(PROVERB_CHOICE_ROUND_COUNT)
    expect(state.bestCombo).toBe(PROVERB_CHOICE_ROUND_COUNT)
  })
})
