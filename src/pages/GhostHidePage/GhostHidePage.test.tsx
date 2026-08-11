import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { loadClearProgress } from '../../features/clear-progress/model/clearProgressStorage'
import { applyGhostHideAction, GHOST_HIDE_STAGES, startGhostHide, type GhostHideState } from '../../features/ghost-hide/model/ghostHide'
import { GhostHidePage } from './GhostHidePage'

const makeStorage = (): Storage => {
  const values = new Map<string, string>()
  return {
    get length() { return values.size }, clear: () => values.clear(),
    getItem: (key) => values.get(key) ?? null, key: (index) => Array.from(values.keys())[index] ?? null,
    removeItem: (key) => void values.delete(key), setItem: (key, value) => void values.set(key, value),
  }
}

const renderPage = (options: { storage?: Storage; initialState?: GhostHideState } = {}) => render(
  <MemoryRouter future={{ v7_relativeSplatPath: true, v7_startTransition: true }}>
    <GhostHidePage {...options} />
  </MemoryRouter>,
)

describe('GhostHidePage', () => {
  it('turns remembering and finding a hiding ghost into the play loop', async () => {
    const user = userEvent.setup()
    renderPage()

    expect(screen.getByRole('heading', { level: 1, name: 'おばけ かくれんぼ' })).toBeInTheDocument()
    expect(screen.queryByText(/もんだい|正解|不正解/)).not.toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'おばけやしきへ' }))
    expect(screen.getByRole('heading', { level: 2, name: 'この おばけを おぼえて！' })).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'かくれた！さがす' }))
    await user.click(screen.getByRole('button', { name: 'おばけ 2' }))

    expect(screen.getByRole('heading', { level: 2, name: 'みつけた！' })).toBeInTheDocument()
  })

  it('records a clear after finding the final ghost', async () => {
    const user = userEvent.setup()
    const storage = makeStorage()
    const finalRound = GHOST_HIDE_STAGES.length - 1
    const hunting = applyGhostHideAction(startGhostHide(finalRound), { type: 'hide-target' }).state
    renderPage({ storage, initialState: hunting })

    await user.click(screen.getByRole('button', { name: `おばけ ${GHOST_HIDE_STAGES[finalRound].targetPosition + 1}` }))

    expect(screen.getByRole('heading', { level: 2, name: 'かくれんぼ マスター！' })).toBeInTheDocument()
    await waitFor(() => expect(loadClearProgress(storage).map((record) => record.gameId)).toContain('ghost-hide'))
  })
})
