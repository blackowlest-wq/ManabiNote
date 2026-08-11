import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { loadClearProgress } from '../../features/clear-progress/model/clearProgressStorage'
import { LABYRINTH_STAGES, startRollingLabyrinth, type RollingLabyrinthState } from '../../features/rolling-labyrinth/model/rollingLabyrinth'
import { RollingLabyrinthPage } from './RollingLabyrinthPage'

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

const renderPage = (options: { storage?: Storage; initialState?: RollingLabyrinthState } = {}) => render(
  <MemoryRouter future={{ v7_relativeSplatPath: true, v7_startTransition: true }}>
    <RollingLabyrinthPage {...options} />
  </MemoryRouter>,
)

describe('RollingLabyrinthPage', () => {
  it('makes rotating the board move the ball through the maze', async () => {
    const user = userEvent.setup()
    renderPage()

    expect(screen.getByRole('heading', { level: 1, name: 'くるくる ラビリンス' })).toBeInTheDocument()
    expect(screen.queryByText(/もんだい|正解|不正解/)).not.toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'ラビリンスへ' }))

    await user.click(screen.getByRole('button', { name: 'みぎへ まわす' }))
    expect(screen.getByLabelText('ころがる たま')).toHaveAttribute('data-position', '0-4')
    await user.click(screen.getByRole('button', { name: 'ひだりへ まわす' }))

    expect(screen.getByRole('heading', { level: 2, name: 'ゴールに とうちゃく！' })).toBeInTheDocument()
  })

  it('records a clear after solving the last rotating maze', async () => {
    const user = userEvent.setup()
    const storage = makeStorage()
    const finalStageIndex = LABYRINTH_STAGES.length - 1
    renderPage({ storage, initialState: startRollingLabyrinth(finalStageIndex) })

    for (const direction of LABYRINTH_STAGES[finalStageIndex].solution) {
      await user.click(screen.getByRole('button', { name: direction === 'rotate-clockwise' ? 'みぎへ まわす' : 'ひだりへ まわす' }))
    }

    expect(screen.getByRole('heading', { level: 2, name: 'くるくる マスター！' })).toBeInTheDocument()
    await waitFor(() => expect(loadClearProgress(storage).map((record) => record.gameId)).toContain('rolling-labyrinth'))
  })
})
