import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { loadClearProgress } from '../../features/clear-progress/model/clearProgressStorage'
import {
  FLAG_VOYAGE_ROUND_COUNT,
  findFlagVoyageCountry,
  startFlagVoyage,
  type FlagVoyageState,
} from '../../features/flag-voyage/model/flagVoyage'
import { FlagVoyagePage } from './FlagVoyagePage'

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

const renderPage = (options: { storage?: Storage; initialState?: FlagVoyageState } = {}) => render(
  <MemoryRouter future={{ v7_relativeSplatPath: true, v7_startTransition: true }}>
    <FlagVoyagePage random={alwaysFirst} {...options} />
  </MemoryRouter>,
)

describe('FlagVoyagePage', () => {
  it('makes the flag the main clue and keeps the world map optional', async () => {
    const user = userEvent.setup()
    renderPage()

    await user.click(screen.getByRole('button', { name: '国旗の旅へ しゅっぱつ' }))

    expect(screen.getByRole('img', { name: /の国旗/ })).toBeInTheDocument()
    expect(screen.getByRole('group', { name: '国の名前をえらぶ' }).querySelectorAll('button')).toHaveLength(4)
    expect(screen.queryByRole('img', { name: '国の位置を示す世界地図' })).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'ちずのヒントを見る' }))

    expect(await screen.findByRole('img', { name: '国の位置を示す世界地図' })).toBeInTheDocument()
    expect(screen.getByText(/このあたり/)).toBeInTheDocument()
  })

  it('shows a passport stamp and advances after the country is found', async () => {
    const user = userEvent.setup()
    const state = startFlagVoyage(alwaysFirst)
    const country = findFlagVoyageCountry(state.question.countryId)
    if (!country) throw new Error('国が見つかりません')
    renderPage({ initialState: state })

    await user.click(screen.getByRole('button', { name: country.name }))

    expect(screen.getByRole('status')).toHaveTextContent(`${country.name} せいかい`)
    expect(screen.getByLabelText('パスポートのスタンプ')).toHaveTextContent('1')
    await user.click(screen.getByRole('button', { name: 'つぎの国旗へ' }))
    expect(screen.getByText(`2 / ${FLAG_VOYAGE_ROUND_COUNT}`)).toBeInTheDocument()
  })

  it('records a clear after the final flag is identified', async () => {
    const user = userEvent.setup()
    const storage = makeStorage()
    const started = startFlagVoyage(alwaysFirst)
    const finalCountryId = started.journeyCountryIds[FLAG_VOYAGE_ROUND_COUNT - 1]
    if (!finalCountryId) throw new Error('最後の国がありません')
    const initialState: FlagVoyageState = {
      ...started,
      roundIndex: FLAG_VOYAGE_ROUND_COUNT - 1,
      question: {
        countryId: finalCountryId,
        choiceCountryIds: [finalCountryId, ...started.question.choiceCountryIds.filter((id) => id !== finalCountryId).slice(0, 3)],
      },
      correctCount: FLAG_VOYAGE_ROUND_COUNT - 1,
    }
    const country = findFlagVoyageCountry(finalCountryId)
    if (!country) throw new Error('最後の国が見つかりません')
    renderPage({ storage, initialState })

    await user.click(screen.getByRole('button', { name: country.name }))
    await user.click(screen.getByRole('button', { name: 'せかい一周を おえる' }))

    expect(screen.getByRole('heading', { level: 2, name: 'せかい一周 たっせい！' })).toBeInTheDocument()
    expect(loadClearProgress(storage).map(({ gameId }) => gameId)).toContain('flag-voyage')
  })
})
