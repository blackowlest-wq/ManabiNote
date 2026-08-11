import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { CAT_CHASE_STAGES, startCatChase } from '../../features/cat-chase/model/catChase'
import { loadClearProgress } from '../../features/clear-progress/model/clearProgressStorage'
import { CatChasePage } from './CatChasePage'

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
    <CatChasePage {...props} />
  </MemoryRouter>,
)

describe('CatChasePage', () => {
  it('makes trapping the moving mouse the game itself', async () => {
    const user = userEvent.setup()
    renderPage()
    expect(screen.queryByText(/もんだい|正解|不正解/)).not.toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'おいかける！' }))
    for (const index of CAT_CHASE_STAGES[0].solution) {
      await user.click(screen.getByRole('button', { name: `マス ${index + 1}` }))
    }
    expect(screen.getByRole('heading', { name: 'ねずみを つかまえた！' })).toBeInTheDocument()
  })

  it('records a clear after catching the final mouse', async () => {
    const user = userEvent.setup()
    const store = storage()
    const stageIndex = CAT_CHASE_STAGES.length - 1
    renderPage({ storage: store, initialState: startCatChase(stageIndex) })
    for (const index of CAT_CHASE_STAGES[stageIndex].solution) {
      await user.click(screen.getByRole('button', { name: `マス ${index + 1}` }))
    }
    expect(screen.getByRole('heading', { name: 'おいかけっこ マスター！' })).toBeInTheDocument()
    await waitFor(() => expect(loadClearProgress(store).some(item => item.gameId === 'cat-chase')).toBe(true))
  })
})
