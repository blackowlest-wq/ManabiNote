import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { ANIMAL_CROSSING_STAGES, startAnimalCrossing } from '../../features/animal-crossing/model/animalCrossing'
import { loadClearProgress } from '../../features/clear-progress/model/clearProgressStorage'
import { AnimalCrossingPage } from './AnimalCrossingPage'

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
    <AnimalCrossingPage {...props} />
  </MemoryRouter>,
)

describe('AnimalCrossingPage', () => {
  it('makes live signal control the game itself', async () => {
    const user = userEvent.setup()
    renderPage()
    expect(screen.queryByText(/もんだい|正解|不正解/)).not.toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'こうつうせいり！' }))
    expect(screen.getByRole('button', { name: 'よこを あお！' })).toHaveAttribute('aria-pressed', 'true')
    await user.click(screen.getByRole('button', { name: 'たてを あお！' }))
    expect(screen.getByRole('button', { name: 'たてを あお！' })).toHaveAttribute('aria-pressed', 'true')
  })

  it('records a clear when the final animal leaves safely', async () => {
    const store = storage()
    const stageIndex = ANIMAL_CROSSING_STAGES.length - 1
    const stage = ANIMAL_CROSSING_STAGES[stageIndex]
    renderPage({
      storage: store,
      initialState: {
        ...startAnimalCrossing(stageIndex),
        spawnCursor: stage.spawns.length,
        cars: [{ id: 1, route: 'horizontal' as const, position: 1 }],
      },
    })
    expect(await screen.findByRole('heading', { name: 'こうさてん マスター！' }, { timeout: 1600 })).toBeInTheDocument()
    await waitFor(() => expect(loadClearProgress(store).some(item => item.gameId === 'animal-crossing')).toBe(true))
  })
})
