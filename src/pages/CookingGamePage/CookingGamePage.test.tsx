import { act, fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { loadClearProgress } from '../../features/clear-progress/model/clearProgressStorage'
import { CookingGamePage } from './CookingGamePage'

const noShuffle = () => 0

const makeStorage = (): Storage => {
  const values = new Map<string, string>()
  return {
    get length() {
      return values.size
    },
    clear: () => values.clear(),
    getItem: (key) => values.get(key) ?? null,
    key: (index) => Array.from(values.keys())[index] ?? null,
    removeItem: (key) => void values.delete(key),
    setItem: (key, value) => void values.set(key, value),
  }
}

const renderPage = (options: { storage?: Storage; durationSeconds?: number } = {}) => render(
  <MemoryRouter future={{ v7_relativeSplatPath: true, v7_startTransition: true }}>
    <CookingGamePage random={noShuffle} {...options} />
  </MemoryRouter>,
)

describe('CookingGamePage', () => {
  afterEach(() => vi.useRealTimers())

  it('starts as a game counter instead of a question screen', async () => {
    const user = userEvent.setup()
    renderPage()

    expect(screen.getByRole('heading', { level: 1, name: 'わくわくキッチン' })).toBeInTheDocument()
    expect(screen.queryByText(/もんだい|正解|不正解/)).not.toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'おみせを ひらく' }))

    expect(screen.getByLabelText('ちゅうもん')).toBeInTheDocument()
    expect(screen.getAllByRole('button', { name: /^ちゅうもん / })).toHaveLength(2)
    expect(screen.getByLabelText('しょくざいレーン')).toBeInTheDocument()
    expect(screen.getAllByRole('button', { name: /を とる$/ })).toHaveLength(6)
  })

  it('serves a finished dish and starts a combo', async () => {
    const user = userEvent.setup()
    renderPage()
    await user.click(screen.getByRole('button', { name: 'おみせを ひらく' }))

    for (const ingredient of ['パン', 'レタス', 'トマト', 'パン']) {
      await user.click(screen.getByRole('button', { name: `${ingredient}を とる` }))
    }

    expect(screen.getByRole('status')).toHaveTextContent('サンドイッチが できた！')
    expect(screen.getByLabelText('できた りょうり 1さら')).toBeInTheDocument()
    expect(screen.getByLabelText('1コンボ')).toBeInTheDocument()
  })

  it('records a clear after serving four dishes before closing time', async () => {
    vi.useFakeTimers()
    const storage = makeStorage()
    renderPage({ storage, durationSeconds: 1 })
    fireEvent.click(screen.getByRole('button', { name: 'おみせを ひらく' }))

    const dishes = [
      ['パン', 'レタス', 'トマト', 'パン'],
      ['パン', 'たまご', 'ぎゅうにゅう'],
      ['りんご', 'バナナ', 'いちご'],
      ['にんじん', 'ブロッコリー', 'トマト'],
    ]
    for (const dish of dishes) {
      for (const ingredient of dish) {
        fireEvent.click(screen.getByRole('button', { name: `${ingredient}を とる` }))
      }
    }
    await act(async () => vi.advanceTimersByTimeAsync(1_000))

    expect(screen.getByRole('heading', { level: 2, name: 'キッチンマスター！' })).toBeInTheDocument()
    expect(loadClearProgress(storage).map((record) => record.gameId)).toContain('cooking')
  })
})
