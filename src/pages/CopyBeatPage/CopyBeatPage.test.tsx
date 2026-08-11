import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { loadClearProgress } from '../../features/clear-progress/model/clearProgressStorage'
import { COPY_BEAT_CLEAR_ROUND, startCopyBeat, type CopyBeatState } from '../../features/copy-beat/model/copyBeat'
import { CopyBeatPage } from './CopyBeatPage'

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

const renderPage = (options: { storage?: Storage; initialState?: CopyBeatState } = {}) => render(
  <MemoryRouter future={{ v7_relativeSplatPath: true, v7_startTransition: true }}>
    <CopyBeatPage random={alwaysFirst} {...options} />
  </MemoryRouter>,
)

describe('CopyBeatPage', () => {
  it('presents the activity as a rhythm game', () => {
    renderPage()

    expect(screen.getByRole('heading', { level: 1, name: 'まねっこビート' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'ライブ スタート' })).toBeInTheDocument()
    expect(screen.queryByText(/もんだい|正解|不正解/)).not.toBeInTheDocument()
  })

  it('turns a copied beat into the next round', async () => {
    const user = userEvent.setup()
    const initialState: CopyBeatState = {
      ...startCopyBeat(alwaysFirst),
      status: 'input',
    }
    renderPage({ initialState })

    await user.click(screen.getByRole('button', { name: 'おひさまパッド' }))

    expect(screen.getByRole('heading', { level: 2, name: 'ビート ばっちり！' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'つぎの ビート' })).toBeInTheDocument()
  })

  it('records a clear after the final copied pattern', async () => {
    const user = userEvent.setup()
    const storage = makeStorage()
    const initialState: CopyBeatState = {
      ...startCopyBeat(alwaysFirst),
      status: 'input',
      round: COPY_BEAT_CLEAR_ROUND,
    }
    renderPage({ storage, initialState })

    await user.click(screen.getByRole('button', { name: 'おひさまパッド' }))

    expect(screen.getByRole('heading', { level: 2, name: 'ライブ だいせいこう！' })).toBeInTheDocument()
    await waitFor(() => expect(loadClearProgress(storage).map((record) => record.gameId)).toContain('copy-beat'))
  })
})
