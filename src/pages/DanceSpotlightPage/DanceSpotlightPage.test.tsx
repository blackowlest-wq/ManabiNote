import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { DANCE_SPOTLIGHT_STAGES, startDanceSpotlight } from '../../features/dance-spotlight/model/danceSpotlight'
import { loadClearProgress } from '../../features/clear-progress/model/clearProgressStorage'
import { DanceSpotlightPage } from './DanceSpotlightPage'

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
    <DanceSpotlightPage {...props} />
  </MemoryRouter>,
)

describe('DanceSpotlightPage', () => {
  it('makes moving through a live light pattern the game itself', async () => {
    const user = userEvent.setup()
    renderPage()
    expect(screen.queryByText(/もんだい|正解|不正解/)).not.toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'ダンス スタート！' }))
    await user.click(screen.getByRole('button', { name: 'ひだりへ' }))
    expect(screen.getByRole('button', { name: 'ひだりへ' })).toHaveAttribute('aria-pressed', 'true')
  })

  it('records a clear after the final spotlight beat', async () => {
    const store = storage()
    const stageIndex = DANCE_SPOTLIGHT_STAGES.length - 1
    const stage = DANCE_SPOTLIGHT_STAGES[stageIndex]
    const beat = stage.beats - 1
    renderPage({ storage: store, initialState: { ...startDanceSpotlight(stageIndex), beat, dancerLane: stage.pattern[beat % stage.pattern.length] } })
    expect(await screen.findByRole('heading', { name: 'ダンス マスター！' }, { timeout: 1800 })).toBeInTheDocument()
    await waitFor(() => expect(loadClearProgress(store).some(item => item.gameId === 'dance-spotlight')).toBe(true))
  })
})
