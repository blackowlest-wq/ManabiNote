import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { loadClearProgress } from '../../features/clear-progress/model/clearProgressStorage'
import {
  findProverb,
  PROVERB_CHOICE_ROUND_COUNT,
  startProverbChoice,
  type ProverbChoiceState,
} from '../../features/proverb-choice/model/proverbChoice'
import { ProverbChoicePage } from './ProverbChoicePage'

const alwaysFirst = () => 0

const makeStorage = (): Storage => {
  const values = new Map<string, string>()
  return {
    get length() { return values.size },
    clear: () => values.clear(),
    getItem: (key) => values.get(key) ?? null,
    key: (index) => Array.from(values.keys())[index] ?? null,
    removeItem: (key) => void values.delete(key),
    setItem: (key, value) => void values.set(key, value),
  }
}

const renderPage = (options: { storage?: Storage; initialState?: ProverbChoiceState } = {}) => render(
  <MemoryRouter future={{ v7_relativeSplatPath: true, v7_startTransition: true }}>
    <ProverbChoicePage random={alwaysFirst} {...options} />
  </MemoryRouter>,
)

describe('ProverbChoicePage', () => {
  it('shows the explanation and four proverb choices after starting', async () => {
    const user = userEvent.setup()
    renderPage()

    await user.click(screen.getByRole('button', { name: 'ことわざクイズを はじめる' }))

    expect(screen.getByRole('group', { name: 'ことわざをえらぶ' }).querySelectorAll('button')).toHaveLength(4)
    expect(screen.getByRole('region', { name: 'ことわざの説明から選ぶ問題' })).toBeInTheDocument()
    expect(screen.getByLabelText('ことわざの説明')).not.toBeEmptyDOMElement()
  })

  it('shows feedback after a wrong answer and advances after a correct answer', async () => {
    const user = userEvent.setup()
    const state = startProverbChoice(alwaysFirst)
    const wrongProverbId = state.question.choiceProverbIds.find((id) => id !== state.question.proverbId)
    if (!wrongProverbId) throw new Error('不正解の選択肢がありません')
    const wrongProverb = findProverb(wrongProverbId)
    const correctProverb = findProverb(state.question.proverbId)
    if (!wrongProverb || !correctProverb) throw new Error('ことわざが見つかりません')
    renderPage({ initialState: state })

    await user.click(screen.getByRole('button', { name: wrongProverb.proverb }))

    expect(screen.getByRole('status')).toHaveTextContent('おしい')
    await user.click(screen.getByRole('button', { name: correctProverb.proverb }))

    expect(screen.getByRole('status')).toHaveTextContent('せいかい')
    expect(screen.getByRole('button', { name: 'つぎの ことわざへ' })).toBeInTheDocument()
  })

  it('records a clear after the final proverb', async () => {
    const user = userEvent.setup()
    const storage = makeStorage()
    const started = startProverbChoice(alwaysFirst)
    const finalProverbId = started.journeyProverbIds[PROVERB_CHOICE_ROUND_COUNT - 1]
    if (!finalProverbId) throw new Error('最後のことわざがありません')
    const finalProverb = findProverb(finalProverbId)
    if (!finalProverb) throw new Error('最後のことわざが見つかりません')
    const initialState: ProverbChoiceState = {
      ...started,
      roundIndex: PROVERB_CHOICE_ROUND_COUNT - 1,
      question: {
        proverbId: finalProverbId,
        choiceProverbIds: [finalProverbId, ...started.question.choiceProverbIds.filter((id) => id !== finalProverbId).slice(0, 3)],
      },
      correctCount: PROVERB_CHOICE_ROUND_COUNT - 1,
    }
    renderPage({ storage, initialState })

    await user.click(screen.getByRole('button', { name: finalProverb.proverb }))
    await user.click(screen.getByRole('button', { name: 'けっかを見る' }))

    expect(screen.getByRole('heading', { level: 2, name: 'ことわざマスター！' })).toBeInTheDocument()
    expect(loadClearProgress(storage).map(({ gameId }) => gameId)).toContain('proverb-choice')
  })
})
