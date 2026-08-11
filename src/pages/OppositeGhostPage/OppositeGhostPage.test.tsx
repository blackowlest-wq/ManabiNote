import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { loadClearProgress } from '../../features/clear-progress/model/clearProgressStorage'
import { OPPOSITE_LEVEL_TARGET, startOppositeGhost, type OppositeGhostState } from '../../features/opposite-ghost/model/oppositeGhost'
import { OppositeGhostPage } from './OppositeGhostPage'

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

const renderPage = (options: { storage?: Storage; initialState?: OppositeGhostState } = {}) => render(
  <MemoryRouter future={{ v7_relativeSplatPath: true, v7_startTransition: true }}>
    <OppositeGhostPage random={alwaysFirst} {...options} />
  </MemoryRouter>,
)

describe('OppositeGhostPage', () => {
  it('turns rule switching into a timed left-right action game', async () => {
    const user = userEvent.setup()
    renderPage()

    expect(screen.getByRole('heading', { level: 1, name: 'アベコベおばけ' })).toBeInTheDocument()
    expect(screen.queryByText(/もんだい|正解|不正解/)).not.toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'よるの もりへ' }))

    expect(screen.getByLabelText('いまの ゲート')).toHaveTextContent('🐰')
    await user.click(screen.getByRole('button', { name: 'ひだりへ ダッシュ' }))

    expect(screen.getByRole('status')).toHaveTextContent('ゲートを ぬけた！')
    expect(screen.getByLabelText('ぬけた ゲートの かず')).toHaveTextContent('1')
  })

  it('records a clear after the final mixed gate', async () => {
    const user = userEvent.setup()
    const storage = makeStorage()
    const initialState: OppositeGhostState = {
      ...startOppositeGhost(alwaysFirst),
      levelIndex: 2,
      currentCard: { actor: 'rabbit', arrow: 'left' },
      clearedInLevel: OPPOSITE_LEVEL_TARGET - 1,
      totalCleared: OPPOSITE_LEVEL_TARGET * 3 - 1,
    }
    renderPage({ storage, initialState })

    await user.click(screen.getByRole('button', { name: 'ひだりへ ダッシュ' }))

    expect(screen.getByRole('heading', { level: 2, name: 'アベコベ マスター！' })).toBeInTheDocument()
    await waitFor(() => expect(loadClearProgress(storage).map((record) => record.gameId)).toContain('opposite-ghost'))
  })
})
