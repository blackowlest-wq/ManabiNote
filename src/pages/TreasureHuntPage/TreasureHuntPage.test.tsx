import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { loadClearProgress } from '../../features/clear-progress/model/clearProgressStorage'
import { TREASURE_CLEAR_TARGET, TREASURE_ROUNDS, type TreasureHuntState } from '../../features/treasure-hunt/model/treasureHunt'
import { TreasureHuntPage } from './TreasureHuntPage'

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

const renderPage = (options: { storage?: Storage; initialState?: TreasureHuntState } = {}) => render(
  <MemoryRouter future={{ v7_relativeSplatPath: true, v7_startTransition: true }}>
    <TreasureHuntPage random={alwaysFirst} {...options} />
  </MemoryRouter>,
)

describe('TreasureHuntPage', () => {
  it('turns each dig into a map clue and celebrates finding treasure', async () => {
    const user = userEvent.setup()
    renderPage()

    expect(screen.getByRole('heading', { level: 1, name: 'どこかな？たからじま' })).toBeInTheDocument()
    expect(screen.queryByText(/もんだい|正解|不正解/)).not.toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'たからを さがす' }))

    expect(screen.getByRole('grid', { name: 'たからじまの ちず' })).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'ばしょ 16を ほる' }))
    expect(screen.getByRole('status')).toHaveTextContent('↖')

    await user.click(screen.getByRole('button', { name: 'ばしょ 1を ほる' }))
    expect(screen.getByRole('heading', { level: 2, name: 'たからを はっけん！' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'つぎの しま' })).toBeInTheDocument()
  })

  it('records a clear after the final treasure island', async () => {
    const user = userEvent.setup()
    const storage = makeStorage()
    const finalRoundIndex = TREASURE_ROUNDS.length - 1
    const finalRound = TREASURE_ROUNDS[finalRoundIndex]
    const initialState: TreasureHuntState = {
      status: 'playing',
      roundIndex: finalRoundIndex,
      treasureIndex: 0,
      dugCells: [],
      digsLeft: finalRound.maxDigs,
      foundCount: TREASURE_CLEAR_TARGET - 1,
      score: 200,
      combo: 0,
      bestCombo: 1,
    }
    renderPage({ storage, initialState })

    await user.click(screen.getByRole('button', { name: 'ばしょ 1を ほる' }))
    await user.click(screen.getByRole('button', { name: 'けっかを みる' }))

    expect(screen.getByRole('heading', { level: 2, name: 'トレジャーハンター！' })).toBeInTheDocument()
    expect(loadClearProgress(storage).map((record) => record.gameId)).toContain('treasure-hunt')
  })
})
