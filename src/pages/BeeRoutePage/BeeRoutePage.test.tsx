import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { BEE_ROUTE_STAGES, startBeeRoute, type BeeRouteState } from '../../features/bee-route/model/beeRoute'
import { loadClearProgress } from '../../features/clear-progress/model/clearProgressStorage'
import { BeeRoutePage } from './BeeRoutePage'

const makeStorage = (): Storage => {
  const values = new Map<string, string>()
  return {
    get length() { return values.size }, clear: () => values.clear(),
    getItem: (key) => values.get(key) ?? null, key: (index) => Array.from(values.keys())[index] ?? null,
    removeItem: (key) => void values.delete(key), setItem: (key, value) => void values.set(key, value),
  }
}

const renderPage = (options: { storage?: Storage; initialState?: BeeRouteState } = {}) => render(
  <MemoryRouter future={{ v7_relativeSplatPath: true, v7_startTransition: true }}>
    <BeeRoutePage {...options} />
  </MemoryRouter>,
)

describe('BeeRoutePage', () => {
  it('makes choosing a short flower route the play loop instead of a quiz', async () => {
    const user = userEvent.setup()
    renderPage()

    expect(screen.getByRole('heading', { level: 1, name: 'みつばち フラワールート' })).toBeInTheDocument()
    expect(screen.queryByText(/もんだい|正解|不正解/)).not.toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'おはなばたけへ' }))
    await user.click(screen.getByRole('button', { name: 'おはな A' }))
    await user.click(screen.getByRole('button', { name: 'はちのすへ もどる' }))

    expect(screen.getByRole('heading', { level: 2, name: 'はちみつを おとどけ！' })).toBeInTheDocument()
  })

  it('records a clear after completing the final flower route', async () => {
    const user = userEvent.setup()
    const storage = makeStorage()
    const finalStageIndex = BEE_ROUTE_STAGES.length - 1
    renderPage({ storage, initialState: startBeeRoute(finalStageIndex) })

    for (const target of BEE_ROUTE_STAGES[finalStageIndex].solution) {
      await user.click(screen.getByRole('button', { name: target === 'hive' ? 'はちのすへ もどる' : `おはな ${target.toUpperCase()}` }))
    }

    expect(screen.getByRole('heading', { level: 2, name: 'フラワールート マスター！' })).toBeInTheDocument()
    await waitFor(() => expect(loadClearProgress(storage).map((record) => record.gameId)).toContain('bee-route'))
  })
})
