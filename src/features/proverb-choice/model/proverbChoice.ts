import { PROVERBS, type ProverbId } from '../data/proverbs'

export const PROVERB_CHOICE_ROUND_COUNT = 10

export type ProverbChoiceQuestion = {
  proverbId: ProverbId
  choiceProverbIds: readonly ProverbId[]
}

export type ProverbChoiceState = {
  status: 'playing' | 'round-won' | 'finished'
  journeyProverbIds: readonly ProverbId[]
  roundIndex: number
  question: ProverbChoiceQuestion
  selectedProverbId: ProverbId | null
  score: number
  combo: number
  bestCombo: number
  correctCount: number
  wrongCount: number
}

export type ProverbChoiceAction =
  | { type: 'choose'; proverbId: ProverbId }
  | { type: 'next' }

export type ProverbChoiceEvent =
  | { type: 'proverb-missed'; proverbId: ProverbId }
  | { type: 'proverb-found'; proverbId: ProverbId; points: number }
  | { type: 'quiz-finished' }

export type ProverbChoiceTransition = {
  state: ProverbChoiceState
  events: readonly ProverbChoiceEvent[]
}

const proverbIds = PROVERBS.map(({ id }) => id)

const randomIndex = (length: number, random: () => number) =>
  Math.floor(Math.min(Math.max(random(), 0), 0.999999) * length)

const shuffle = <T,>(items: readonly T[], random: () => number): T[] => {
  const result = [...items]
  for (let index = result.length - 1; index > 0; index -= 1) {
    const swapIndex = randomIndex(index + 1, random)
    ;[result[index], result[swapIndex]] = [result[swapIndex], result[index]]
  }
  return result
}

const createQuestion = (proverbId: ProverbId, random: () => number): ProverbChoiceQuestion => {
  const distractors = shuffle(proverbIds.filter((id) => id !== proverbId), random).slice(0, 3)
  return {
    proverbId,
    choiceProverbIds: shuffle([proverbId, ...distractors], random),
  }
}

export function startProverbChoice(random: () => number = Math.random): ProverbChoiceState {
  const journeyProverbIds = shuffle(proverbIds, random).slice(0, PROVERB_CHOICE_ROUND_COUNT)
  const firstProverbId = journeyProverbIds[0]
  if (!firstProverbId) throw new Error('ことわざの問題を始められません')

  return {
    status: 'playing',
    journeyProverbIds,
    roundIndex: 0,
    question: createQuestion(firstProverbId, random),
    selectedProverbId: null,
    score: 0,
    combo: 0,
    bestCombo: 0,
    correctCount: 0,
    wrongCount: 0,
  }
}

export function applyProverbChoiceAction(
  state: ProverbChoiceState,
  action: ProverbChoiceAction,
  random: () => number = Math.random,
): ProverbChoiceTransition {
  if (state.status === 'finished') return { state, events: [] }

  if (action.type === 'next') {
    if (state.status !== 'round-won') return { state, events: [] }
    const nextRoundIndex = state.roundIndex + 1
    const nextProverbId = state.journeyProverbIds[nextRoundIndex]
    if (!nextProverbId) {
      return {
        state: { ...state, status: 'finished' },
        events: [{ type: 'quiz-finished' }],
      }
    }
    return {
      state: {
        ...state,
        status: 'playing',
        roundIndex: nextRoundIndex,
        question: createQuestion(nextProverbId, random),
        selectedProverbId: null,
      },
      events: [],
    }
  }

  if (state.status !== 'playing' || !state.question.choiceProverbIds.includes(action.proverbId)) {
    return { state, events: [] }
  }

  if (action.proverbId !== state.question.proverbId) {
    return {
      state: {
        ...state,
        selectedProverbId: action.proverbId,
        combo: 0,
        wrongCount: state.wrongCount + 1,
      },
      events: [{ type: 'proverb-missed', proverbId: action.proverbId }],
    }
  }

  const combo = state.combo + 1
  const points = 100 + state.combo * 20
  return {
    state: {
      ...state,
      status: 'round-won',
      selectedProverbId: action.proverbId,
      score: state.score + points,
      combo,
      bestCombo: Math.max(state.bestCombo, combo),
      correctCount: state.correctCount + 1,
    },
    events: [{ type: 'proverb-found', proverbId: action.proverbId, points }],
  }
}

export const findProverb = (proverbId: ProverbId) =>
  PROVERBS.find(({ id }) => id === proverbId)
