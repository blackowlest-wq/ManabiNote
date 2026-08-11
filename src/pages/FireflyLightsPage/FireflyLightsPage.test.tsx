import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { loadClearProgress } from '../../features/clear-progress/model/clearProgressStorage'
import { FIREFLY_STAGES, startFireflyLights, type FireflyLightsState } from '../../features/firefly-lights/model/fireflyLights'
import { FireflyLightsPage } from './FireflyLightsPage'

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

const renderPage = (options: { storage?: Storage; initialState?: FireflyLightsState } = {}) => render(
  <MemoryRouter future={{ v7_relativeSplatPath: true, v7_startTransition: true }}>
    <FireflyLightsPage {...options} />
  </MemoryRouter>,
)

describe('FireflyLightsPage', () => {
  it('makes changing a cluster of lights the main puzzle', async () => {
    const user = userEvent.setup()
    renderPage()

    expect(screen.getByRole('heading', { level: 1, name: 'ぴかぴか ほたる' })).toBeInTheDocument()
    expect(screen.queryByText(/もんだい|正解|不正解/)).not.toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'よるの にわへ' }))
    await user.click(screen.getByRole('button', { name: 'ほたる 1' }))

    expect(screen.getByRole('heading', { level: 2, name: 'ぜんぶ ぴかぴか！' })).toBeInTheDocument()
  })

  it('records a clear after lighting the last garden', async () => {
    const user = userEvent.setup()
    const storage = makeStorage()
    const finalStageIndex = FIREFLY_STAGES.length - 1
    renderPage({ storage, initialState: startFireflyLights(finalStageIndex) })

    for (const index of FIREFLY_STAGES[finalStageIndex].solution) {
      await user.click(screen.getByRole('button', { name: `ほたる ${index + 1}` }))
    }

    expect(screen.getByRole('heading', { level: 2, name: 'ほたる マスター！' })).toBeInTheDocument()
    await waitFor(() => expect(loadClearProgress(storage).map((record) => record.gameId)).toContain('firefly-lights'))
  })
})
