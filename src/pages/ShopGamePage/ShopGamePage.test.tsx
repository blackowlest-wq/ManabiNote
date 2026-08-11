import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { loadClearProgress } from '../../features/clear-progress/model/clearProgressStorage'
import type { ShopGameState } from '../../features/shop-game/model/shopGame'
import { ShopGamePage } from './ShopGamePage'

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

const renderPage = (options: { storage?: Storage; initialState?: ShopGameState } = {}) => render(
  <MemoryRouter future={{ v7_relativeSplatPath: true, v7_startTransition: true }}>
    <ShopGamePage {...options} />
  </MemoryRouter>,
)

describe('ShopGamePage', () => {
  it('lets a child fill a basket and serve a customer without a quiz screen', async () => {
    const user = userEvent.setup()
    renderPage()

    expect(screen.getByRole('heading', { level: 1, name: 'どうぶつマーケット' })).toBeInTheDocument()
    expect(screen.queryByText(/もんだい|正解|不正解/)).not.toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'おみせを ひらく' }))

    expect(screen.getByLabelText('おきゃくさんの ちゅうもん')).toBeInTheDocument()
    expect(screen.getByLabelText('りんご2こ')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'りんごを かごに いれる' }))
    await user.click(screen.getByRole('button', { name: 'りんごを かごに いれる' }))
    await user.click(screen.getByRole('button', { name: 'おきゃくさんに わたす' }))

    expect(screen.getByRole('status')).toHaveTextContent('おかいあげ ありがとう！')
    expect(screen.getByLabelText('せっきゃく 1にん')).toBeInTheDocument()
    expect(screen.getByLabelText('1コンボ')).toBeInTheDocument()
  })

  it('records a clear after serving the fifth customer', async () => {
    const user = userEvent.setup()
    const storage = makeStorage()
    const initialState: ShopGameState = {
      status: 'playing',
      durationSeconds: 60,
      timeLeft: 30,
      orderIndex: 4,
      basket: [],
      score: 1_000,
      coins: 20,
      combo: 4,
      bestCombo: 4,
      servedCount: 4,
      missedCount: 0,
      patience: 10,
      maxPatience: 10,
      orderHidden: false,
    }
    renderPage({ storage, initialState })

    for (const product of ['いちご', 'いちご', 'バナナ', 'ぎゅうにゅう']) {
      await user.click(screen.getByRole('button', { name: `${product}を かごに いれる` }))
    }
    await user.click(screen.getByRole('button', { name: 'おきゃくさんに わたす' }))

    expect(screen.getByRole('heading', { level: 2, name: 'おみせマスター！' })).toBeInTheDocument()
    expect(loadClearProgress(storage).map((record) => record.gameId)).toContain('shop-game')
  })
})
