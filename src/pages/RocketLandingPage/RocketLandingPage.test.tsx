import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { loadClearProgress } from '../../features/clear-progress/model/clearProgressStorage'
import { ROCKET_LANDING_STAGES, startRocketLanding } from '../../features/rocket-landing/model/rocketLanding'
import { RocketLandingPage } from './RocketLandingPage'

const storage = (): Storage => {
  const values = new Map<string, string>()
  return {
    get length() { return values.size },
    clear: () => values.clear(),
    getItem: key => values.get(key) ?? null,
    key: index => [...values.keys()][index] ?? null,
    removeItem: key => void values.delete(key),
    setItem: (key, value) => void values.set(key, value),
  }
}

const renderPage = (props = {}) => render(
  <MemoryRouter future={{ v7_relativeSplatPath: true, v7_startTransition: true }}>
    <RocketLandingPage {...props} />
  </MemoryRouter>,
)

describe('RocketLandingPage', () => {
  it('makes controlling the falling rocket the game itself', async () => {
    const user = userEvent.setup()
    renderPage()
    expect(screen.queryByText(/もんだい|正解|不正解/)).not.toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'ちゃくりくへ！' }))
    expect(screen.getByText('⛽ 5')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'ふんしゃ！' }))
    expect(screen.getByText('⛽ 4')).toBeInTheDocument()
  })

  it('records a clear after a safe final landing', async () => {
    const store = storage()
    const stageIndex = ROCKET_LANDING_STAGES.length - 1
    renderPage({ storage: store, initialState: { ...startRocketLanding(stageIndex), altitude: 1, velocity: -1 } })
    expect(await screen.findByRole('heading', { name: 'ちゃくりく マスター！' }, { timeout: 1500 })).toBeInTheDocument()
    await waitFor(() => expect(loadClearProgress(store).some(item => item.gameId === 'rocket-landing')).toBe(true))
  })
})
