import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { startAnimalTower, type AnimalTowerState } from '../../features/animal-tower/model/animalTower'
import { loadClearProgress } from '../../features/clear-progress/model/clearProgressStorage'
import { AnimalTowerPage } from './AnimalTowerPage'

const makeStorage = (): Storage => {
  const values = new Map<string, string>()
  return { get length() { return values.size }, clear: () => values.clear(), getItem: key => values.get(key) ?? null, key: index => [...values.keys()][index] ?? null, removeItem: key => void values.delete(key), setItem: (key, value) => void values.set(key, value) }
}

const renderPage = (props: { storage?: Storage; initialState?: AnimalTowerState } = {}) => render(
  <MemoryRouter future={{ v7_relativeSplatPath: true, v7_startTransition: true }}><AnimalTowerPage {...props} /></MemoryRouter>,
)

describe('AnimalTowerPage', () => {
  it('makes timing and overlap the tower-building play loop', async () => {
    const user = userEvent.setup()
    renderPage()
    expect(screen.getByRole('heading', { level: 1, name: 'ぐらぐら どうぶつタワー' })).toBeInTheDocument()
    expect(screen.queryByText(/もんだい|正解|不正解/)).not.toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'タワーを つくる' }))
    await user.click(screen.getByRole('button', { name: 'ブロックを おとす' }))
    expect(screen.getByText('🏗️ 1 / 8')).toBeInTheDocument()
  })

  it('records a clear when the eighth floor lands', async () => {
    const user = userEvent.setup()
    const storage = makeStorage()
    const initial = startAnimalTower()
    renderPage({ storage, initialState: { ...initial, floor: 7, moving: { ...initial.base }, landed: Array.from({ length: 8 }, () => initial.base) } })
    await user.click(screen.getByRole('button', { name: 'ブロックを おとす' }))
    expect(screen.getByRole('heading', { level: 2, name: 'タワー マスター！' })).toBeInTheDocument()
    await waitFor(() => expect(loadClearProgress(storage).some(record => record.gameId === 'animal-tower')).toBe(true))
  })
})
