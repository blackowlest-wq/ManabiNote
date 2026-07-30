import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it } from 'vitest'
import { appendHistory, loadHistory } from '../../features/history/model/historyStorage'
import type { HistoryRecord } from '../../features/history/model/historyTypes'
import { HistoryPage } from './HistoryPage'

const HISTORY_KEY = 'manabinote.history.v1'

const makeHistory = (id = 'session-1'): HistoryRecord => ({
  id,
  questionType: 'kana-to-picture',
  startedAt: '2026-07-30T09:00:00.000Z',
  score: 2,
  total: 3,
  answers: [
    {
      questionType: 'kana-to-picture',
      questionId: `${id}-question-1`,
      kana: 'あ',
      selectedChoiceId: 'apple',
      correctChoiceId: 'apple',
      isCorrect: true,
    },
    {
      questionType: 'kana-to-picture',
      questionId: `${id}-question-2`,
      kana: 'い',
      selectedChoiceId: 'dog',
      correctChoiceId: 'chair',
      isCorrect: false,
    },
    {
      questionType: 'kana-to-picture',
      questionId: `${id}-question-3`,
      kana: 'う',
      selectedChoiceId: 'cow',
      correctChoiceId: 'cow',
      isCorrect: true,
    },
  ],
})

const makeStorage = (initial: Record<string, string> = {}): Storage => {
  const values = new Map(Object.entries(initial))
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

const renderPage = (storage?: Storage) =>
  render(
    <MemoryRouter future={{ v7_relativeSplatPath: true, v7_startTransition: true }}>
      <HistoryPage storage={storage} />
    </MemoryRouter>,
  )

describe('HistoryPage', () => {
  beforeEach(() => localStorage.clear())

  it('shows the empty state and home link without a clear button when there is no history', () => {
    renderPage()

    expect(screen.getByText('まだ学習履歴がありません')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: '履歴をクリア' })).not.toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'ホームへ戻る' })).toHaveAttribute('href', '/')
  })

  it('shows the execution date, score, per-question correctness, home link, and clear button', () => {
    expect(appendHistory(makeHistory(), localStorage)).toEqual({ ok: true })

    const { container } = renderPage()

    const executionTime = container.querySelector('time')
    expect(executionTime).toHaveAttribute('datetime', '2026-07-30T09:00:00.000Z')
    expect(executionTime).not.toBeEmptyDOMElement()
    expect(screen.getByText('2 / 3')).toBeInTheDocument()
    expect(screen.getByText('あ：正解')).toBeInTheDocument()
    expect(screen.getByText('い：不正解')).toBeInTheDocument()
    expect(screen.getByText('う：正解')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'ホームへ戻る' })).toHaveAttribute('href', '/')
    expect(screen.getByRole('button', { name: '履歴をクリア' })).toBeInTheDocument()
  })

  it('opens an accessible confirmation dialog and cancel keeps the history unchanged', async () => {
    const user = userEvent.setup()
    expect(appendHistory(makeHistory(), localStorage)).toEqual({ ok: true })
    renderPage()

    await user.click(screen.getByRole('button', { name: '履歴をクリア' }))

    const dialog = screen.getByRole('dialog', { name: '履歴をクリアしますか？' })
    expect(dialog).toHaveAttribute('aria-modal', 'true')
    expect(within(dialog).getByRole('button', { name: '削除する' })).toBeInTheDocument()

    await user.click(within(dialog).getByRole('button', { name: 'キャンセル' }))

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(screen.getByText('2 / 3')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '履歴をクリア' })).toBeInTheDocument()
    expect(loadHistory(localStorage)).toHaveLength(1)
  })

  it('confirms clearing and immediately replaces the records with the empty state', async () => {
    const user = userEvent.setup()
    expect(appendHistory(makeHistory(), localStorage)).toEqual({ ok: true })
    renderPage()

    await user.click(screen.getByRole('button', { name: '履歴をクリア' }))
    await user.click(screen.getByRole('button', { name: '削除する' }))

    expect(screen.getByText('まだ学習履歴がありません')).toBeInTheDocument()
    expect(screen.queryByText('2 / 3')).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: '履歴をクリア' })).not.toBeInTheDocument()
    expect(localStorage.getItem(HISTORY_KEY)).toBeNull()
  })

  it('keeps unrelated local storage entries when confirming the clear action', async () => {
    const user = userEvent.setup()
    expect(appendHistory(makeHistory(), localStorage)).toEqual({ ok: true })
    localStorage.setItem('other.key', 'keep me')
    renderPage()

    await user.click(screen.getByRole('button', { name: '履歴をクリア' }))
    await user.click(screen.getByRole('button', { name: '削除する' }))

    expect(localStorage.getItem('other.key')).toBe('keep me')
  })

  it('preserves the history and shows an alert when clearing fails', async () => {
    const user = userEvent.setup()
    const storage = makeStorage()
    expect(appendHistory(makeHistory('blocked'), storage)).toEqual({ ok: true })
    storage.removeItem = () => {
      throw new Error('blocked')
    }
    renderPage(storage)

    await user.click(screen.getByRole('button', { name: '履歴をクリア' }))
    await user.click(screen.getByRole('button', { name: '削除する' }))

    expect(screen.getByRole('alert')).toHaveTextContent('履歴をクリアできませんでした')
    expect(screen.getByText('2 / 3')).toBeInTheDocument()
    expect(loadHistory(storage).map((record) => record.id)).toEqual(['blocked'])
  })
})
