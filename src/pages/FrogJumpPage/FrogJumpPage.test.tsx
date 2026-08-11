import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { loadClearProgress } from '../../features/clear-progress/model/clearProgressStorage'
import { FROG_JUMP_STAGES, startFrogJump, type FrogJumpState } from '../../features/frog-jump/model/frogJump'
import { FrogJumpPage } from './FrogJumpPage'

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

const renderPage = (options: { storage?: Storage; initialState?: FrogJumpState } = {}) => render(
  <MemoryRouter future={{ v7_relativeSplatPath: true, v7_startTransition: true }}>
    <FrogJumpPage {...options} />
  </MemoryRouter>,
)

describe('FrogJumpPage', () => {
  it('makes swapping the frogs the board objective instead of a quiz', async () => {
    const user = userEvent.setup()
    renderPage()

    expect(screen.getByRole('heading', { level: 1, name: 'かえるジャンプ' })).toBeInTheDocument()
    expect(screen.queryByText(/もんだい|正解|不正解/)).not.toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'いけへ しゅっぱつ' }))

    await user.click(screen.getByRole('button', { name: /^いし 1、/ }))
    await user.click(screen.getByRole('button', { name: /^いし 3、/ }))
    await user.click(screen.getByRole('button', { name: /^いし 2、/ }))

    expect(screen.getByRole('heading', { level: 2, name: 'いれかわり せいこう！' })).toBeInTheDocument()
  })

  it('records a clear after the final pond is solved', async () => {
    const user = userEvent.setup()
    const storage = makeStorage()
    const finalStageIndex = FROG_JUMP_STAGES.length - 1
    renderPage({ storage, initialState: startFrogJump(finalStageIndex) })

    for (const index of FROG_JUMP_STAGES[finalStageIndex].solution) {
      await user.click(screen.getByRole('button', { name: new RegExp(`^いし ${index + 1}、`) }))
    }

    expect(screen.getByRole('heading', { level: 2, name: 'かえるジャンプ マスター！' })).toBeInTheDocument()
    await waitFor(() => expect(loadClearProgress(storage).map((record) => record.gameId)).toContain('frog-jump'))
  })
})
