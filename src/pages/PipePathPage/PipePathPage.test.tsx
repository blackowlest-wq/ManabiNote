import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { loadClearProgress } from '../../features/clear-progress/model/clearProgressStorage'
import { PIPE_PATH_STAGES, type PipePathState } from '../../features/pipe-path/model/pipePath'
import { PipePathPage } from './PipePathPage'

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

const renderPage = (options: { storage?: Storage; initialStageIndex?: number; initialState?: PipePathState } = {}) => render(
  <MemoryRouter future={{ v7_relativeSplatPath: true, v7_startTransition: true }}>
    <PipePathPage {...options} />
  </MemoryRouter>,
)

describe('PipePathPage', () => {
  it('turns pipes by tapping and celebrates flowing water', async () => {
    const user = userEvent.setup()
    renderPage()

    expect(screen.getByRole('heading', { level: 1, name: 'みずの みち' })).toBeInTheDocument()
    expect(screen.queryByText(/もんだい|正解|不正解/)).not.toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'みずを ながす' }))

    expect(screen.getByRole('grid', { name: 'みずの みち ばんめん' })).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'パイプ 5を まわす' }))

    expect(screen.getByRole('heading', { level: 2, name: 'おはなに みずが とどいた！' })).toBeInTheDocument()
    expect(screen.getByText('⭐⭐⭐')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'つぎの ステージ' })).toBeInTheDocument()
  })

  it('records the game clear when the water castle is completed', async () => {
    const user = userEvent.setup()
    const storage = makeStorage()
    const stage = PIPE_PATH_STAGES[5]
    const rotations = stage.tiles.map((tile) => tile?.solutionRotation ?? 0)
    rotations[11] = 0
    const initialState: PipePathState = {
      stageId: stage.id,
      rotations,
      turnCount: 4,
      status: 'playing',
    }
    renderPage({ storage, initialStageIndex: 5, initialState })

    await user.click(screen.getByRole('button', { name: 'パイプ 12を まわす' }))

    expect(screen.getByRole('heading', { level: 2, name: 'みずの おしろ かんせい！' })).toBeInTheDocument()
    expect(loadClearProgress(storage).map((record) => record.gameId)).toContain('pipe-path')
  })
})
