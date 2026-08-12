import { describe, expect, it } from 'vitest'
import {
  applyFlagVoyageAction,
  FLAG_VOYAGE_COUNTRIES,
  FLAG_VOYAGE_ROUND_COUNT,
  startFlagVoyage,
} from './flagVoyage'

const alwaysFirst = () => 0

describe('flagVoyage', () => {
  it('starts a twelve-stop voyage from a pool of forty countries around the world', () => {
    const state = startFlagVoyage(alwaysFirst)

    expect(FLAG_VOYAGE_COUNTRIES).toHaveLength(40)
    expect(state.journeyCountryIds).toHaveLength(FLAG_VOYAGE_ROUND_COUNT)
    expect(new Set(state.journeyCountryIds).size).toBe(FLAG_VOYAGE_ROUND_COUNT)
    expect(state.question.choiceCountryIds).toHaveLength(4)
    expect(new Set(state.question.choiceCountryIds).size).toBe(4)
    expect(state.question.choiceCountryIds).toContain(state.question.countryId)
  })

  it('reveals the map hint and awards fewer points for a hinted answer', () => {
    const state = startFlagVoyage(alwaysFirst)
    const hinted = applyFlagVoyageAction(state, { type: 'show-hint' }, alwaysFirst)
    const answered = applyFlagVoyageAction(hinted.state, { type: 'choose', countryId: state.question.countryId }, alwaysFirst)

    expect(hinted.state.hintUsed).toBe(true)
    expect(hinted.events).toContainEqual({ type: 'hint-shown', countryId: state.question.countryId })
    expect(answered.state.score).toBe(60)
    expect(answered.state.status).toBe('round-won')
  })

  it('builds a combo for correct answers without a hint', () => {
    const state = startFlagVoyage(alwaysFirst)
    const firstWin = applyFlagVoyageAction(state, { type: 'choose', countryId: state.question.countryId }, alwaysFirst)
    const secondRound = applyFlagVoyageAction(firstWin.state, { type: 'next' }, alwaysFirst)
    const secondWin = applyFlagVoyageAction(secondRound.state, { type: 'choose', countryId: secondRound.state.question.countryId }, alwaysFirst)

    expect(firstWin.state.score).toBe(100)
    expect(secondWin.state.combo).toBe(2)
    expect(secondWin.state.score).toBe(220)
  })

  it('keeps the round open and resets the combo after a wrong country', () => {
    const state = { ...startFlagVoyage(alwaysFirst), combo: 3 }
    const wrongCountryId = state.question.choiceCountryIds.find((id) => id !== state.question.countryId)
    if (!wrongCountryId) throw new Error('不正解の選択肢がありません')

    const answered = applyFlagVoyageAction(state, { type: 'choose', countryId: wrongCountryId }, alwaysFirst)

    expect(answered.state.status).toBe('playing')
    expect(answered.state.combo).toBe(0)
    expect(answered.state.wrongCount).toBe(1)
    expect(answered.events).toContainEqual({ type: 'country-missed', countryId: wrongCountryId })
  })

  it('finishes after all twelve flags are identified', () => {
    let state = startFlagVoyage(alwaysFirst)

    for (let round = 0; round < FLAG_VOYAGE_ROUND_COUNT; round += 1) {
      state = applyFlagVoyageAction(state, { type: 'choose', countryId: state.question.countryId }, alwaysFirst).state
      state = applyFlagVoyageAction(state, { type: 'next' }, alwaysFirst).state
    }

    expect(state.status).toBe('finished')
    expect(state.correctCount).toBe(FLAG_VOYAGE_ROUND_COUNT)
    expect(state.bestCombo).toBe(FLAG_VOYAGE_ROUND_COUNT)
  })
})
