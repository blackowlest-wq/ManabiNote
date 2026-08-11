import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { loadClearProgress } from '../../features/clear-progress/model/clearProgressStorage'
import { BALANCE_LEVELS, startBalanceBoat, type BalanceBoatState } from '../../features/balance-boat/model/balanceBoat'
import { BalanceBoatPage } from './BalanceBoatPage'

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

const renderPage = (options: { storage?: Storage; initialState?: BalanceBoatState } = {}) => render(
  <MemoryRouter future={{ v7_relativeSplatPath: true, v7_startTransition: true }}>
    <BalanceBoatPage random={alwaysFirst} {...options} />
  </MemoryRouter>,
)

describe('BalanceBoatPage', () => {
  it('turns comparing both sides into cargo placement', async () => {
    const user = userEvent.setup()
    renderPage()

    expect(screen.getByRole('heading', { level: 1, name: 'ぐらぐら おとどけ便' })).toBeInTheDocument()
    expect(screen.queryByText(/もんだい|正解|不正解/)).not.toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'しゅっこうする' }))

    expect(screen.getByLabelText('つぎの にもつ')).toHaveTextContent('1')
    await user.click(screen.getByRole('button', { name: 'ひだりへ のせる' }))

    expect(screen.getByRole('status')).toHaveTextContent('ひだりへ のせた！')
    expect(screen.getByLabelText('ひだりの おもさ')).toHaveTextContent('1')
  })

  it('records a clear after the final harbor delivery', async () => {
    const user = userEvent.setup()
    const storage = makeStorage()
    const finalLevelIndex = BALANCE_LEVELS.length - 1
    const initialState: BalanceBoatState = {
      ...startBalanceBoat(alwaysFirst),
      levelIndex: finalLevelIndex,
      deliveredInLevel: BALANCE_LEVELS[finalLevelIndex].target - 1,
      totalDelivered: BALANCE_LEVELS.reduce((sum, level) => sum + level.target, 0) - 1,
    }
    renderPage({ storage, initialState })

    await user.click(screen.getByRole('button', { name: 'ひだりへ のせる' }))

    expect(screen.getByRole('heading', { level: 2, name: 'おとどけ だいせいこう！' })).toBeInTheDocument()
    await waitFor(() => expect(loadClearProgress(storage).map((record) => record.gameId)).toContain('balance-boat'))
  })
})
