import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { loadClearProgress } from '../../features/clear-progress/model/clearProgressStorage'
import { FOREST_WAVES, startForestGuard, type ForestGuardState } from '../../features/forest-guard/model/forestGuard'
import { ForestGuardPage } from './ForestGuardPage'

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

const renderPage = (options: { storage?: Storage; initialState?: ForestGuardState } = {}) => render(
  <MemoryRouter future={{ v7_relativeSplatPath: true, v7_startTransition: true }}>
    <ForestGuardPage {...options} />
  </MemoryRouter>,
)

describe('ForestGuardPage', () => {
  it('lets the player build a three-lane defense by tapping guards and lanes', async () => {
    const user = userEvent.setup()
    renderPage()

    expect(screen.getByRole('heading', { level: 1, name: 'もりの まもり隊' })).toBeInTheDocument()
    expect(screen.queryByText(/もんだい|正解|不正解/)).not.toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'もりを まもる' }))

    await user.click(screen.getByRole('button', { name: 'ほのおガードを えらぶ' }))
    await user.click(screen.getByRole('button', { name: 'うえの みちに おく' }))
    await user.click(screen.getByRole('button', { name: 'みずガードを えらぶ' }))
    await user.click(screen.getByRole('button', { name: 'まんなかの みちに おく' }))
    await user.click(screen.getByRole('button', { name: 'はっぱガードを えらぶ' }))
    await user.click(screen.getByRole('button', { name: 'したの みちに おく' }))

    expect(screen.getByRole('button', { name: 'しゅうげき スタート' })).toBeEnabled()
    expect(screen.getByLabelText('のこりの たね')).toHaveTextContent('0')
  })

  it('records the game when all waves have been protected', async () => {
    const storage = makeStorage()
    const initialState: ForestGuardState = {
      ...startForestGuard(),
      status: 'finished',
      waveIndex: FOREST_WAVES.length - 1,
      score: 1500,
      defeatedCount: 12,
    }
    renderPage({ storage, initialState })

    expect(screen.getByRole('heading', { level: 2, name: 'もりを まもった！' })).toBeInTheDocument()
    await waitFor(() => expect(loadClearProgress(storage).map((record) => record.gameId)).toContain('forest-guard'))
  })
})
