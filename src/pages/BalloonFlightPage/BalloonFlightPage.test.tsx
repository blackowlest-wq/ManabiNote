import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { loadClearProgress } from '../../features/clear-progress/model/clearProgressStorage'
import { BALLOON_CLEAR_TARGET, startBalloonFlight, type BalloonFlightState } from '../../features/balloon-flight/model/balloonFlight'
import { BalloonFlightPage } from './BalloonFlightPage'

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

const renderPage = (options: { storage?: Storage; initialState?: BalloonFlightState } = {}) => render(
  <MemoryRouter future={{ v7_relativeSplatPath: true, v7_startTransition: true }}>
    <BalloonFlightPage random={alwaysFirst} tickMilliseconds={100_000} {...options} />
  </MemoryRouter>,
)

describe('BalloonFlightPage', () => {
  it('makes altitude control the main flight action', async () => {
    const user = userEvent.setup()
    renderPage()

    expect(screen.getByRole('heading', { level: 1, name: 'ふわふわ バルーン' })).toBeInTheDocument()
    expect(screen.queryByText(/もんだい|正解|不正解/)).not.toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'そらへ しゅっぱつ' }))
    await user.click(screen.getByRole('button', { name: 'うえへ とぶ' }))

    expect(screen.getByLabelText('ふうせん')).toHaveAttribute('data-row', '0')
    expect(screen.getByRole('status')).toHaveTextContent('ふわっ！ うえへ')
  })

  it('records a clear after passing ten cloud gates', async () => {
    const storage = makeStorage()
    const initialState: BalloonFlightState = {
      ...startBalloonFlight(alwaysFirst),
      status: 'finished',
      passedCount: BALLOON_CLEAR_TARGET,
      score: 1500,
    }
    renderPage({ storage, initialState })

    expect(screen.getByRole('heading', { level: 2, name: 'おそらの エース！' })).toBeInTheDocument()
    await waitFor(() => expect(loadClearProgress(storage).map((record) => record.gameId)).toContain('balloon-flight'))
  })
})
