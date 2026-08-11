import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { loadClearProgress } from '../../features/clear-progress/model/clearProgressStorage'
import { LOG_SLIDE_STAGES, startLogSlide, type LogSlideState } from '../../features/log-slide/model/logSlide'
import { LogSlidePage } from './LogSlidePage'

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

const renderPage = (options: { storage?: Storage; initialState?: LogSlideState } = {}) => render(
  <MemoryRouter future={{ v7_relativeSplatPath: true, v7_startTransition: true }}>
    <LogSlidePage {...options} />
  </MemoryRouter>,
)

describe('LogSlidePage', () => {
  it('makes opening an escape route the board objective instead of a quiz', async () => {
    const user = userEvent.setup()
    renderPage()

    expect(screen.getByRole('heading', { level: 1, name: 'どんぐり だいだっしゅつ' })).toBeInTheDocument()
    expect(screen.queryByText(/もんだい|正解|不正解/)).not.toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'もりへ しゅっぱつ' }))

    await user.click(screen.getByRole('button', { name: 'たての まるた A' }))
    await user.click(screen.getByRole('button', { name: 'したへ うごかす' }))
    await user.click(screen.getByRole('button', { name: 'したへ うごかす' }))
    await user.click(screen.getByRole('button', { name: 'リスの そり' }))
    await user.click(screen.getByRole('button', { name: 'みぎへ うごかす' }))
    await user.click(screen.getByRole('button', { name: 'みぎへ うごかす' }))

    expect(screen.getByRole('heading', { level: 2, name: 'でぐちが ひらいた！' })).toBeInTheDocument()
  })

  it('records a clear after escaping the final forest', async () => {
    const user = userEvent.setup()
    const storage = makeStorage()
    const finalStageIndex = LOG_SLIDE_STAGES.length - 1
    const stage = LOG_SLIDE_STAGES[finalStageIndex]
    renderPage({ storage, initialState: startLogSlide(finalStageIndex) })

    for (const move of stage.solution) {
      const piece = stage.pieces.find((candidate) => candidate.id === move.id)!
      const pieceName = piece.kind === 'squirrel'
        ? 'リスの そり'
        : `${piece.orientation === 'vertical' ? 'たて' : 'よこ'}の まるた ${piece.id.toUpperCase()}`
      const directionName = piece.orientation === 'vertical'
        ? (move.delta === -1 ? 'うえへ うごかす' : 'したへ うごかす')
        : (move.delta === -1 ? 'ひだりへ うごかす' : 'みぎへ うごかす')
      await user.click(screen.getByRole('button', { name: pieceName }))
      await user.click(screen.getByRole('button', { name: directionName }))
    }

    expect(screen.getByRole('heading', { level: 2, name: 'だっしゅつ マスター！' })).toBeInTheDocument()
    await waitFor(() => expect(loadClearProgress(storage).map((record) => record.gameId)).toContain('log-slide'))
  })
})
