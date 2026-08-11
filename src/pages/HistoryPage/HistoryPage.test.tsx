import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it } from 'vitest'
import { GAME_CATEGORY_LIST } from '../../app/gameCategories'
import { loadClearProgress, markGameCleared } from '../../features/clear-progress/model/clearProgressStorage'
import { loadRescueProgress, recordStageResult } from '../../features/rescue-maze/model/rescueProgressStorage'
import { HistoryPage } from './HistoryPage'

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

const renderPage = (storage?: Storage) => render(
  <MemoryRouter future={{ v7_relativeSplatPath: true, v7_startTransition: true }}>
    <HistoryPage storage={storage} />
  </MemoryRouter>,
)

const gameItem = (label: string) => {
  const link = screen.getByRole('link', { name: label })
  const item = link.closest('li')
  if (!item) throw new Error(`${label}の一覧項目がありません`)
  return within(item)
}

describe('HistoryPage', () => {
  beforeEach(() => localStorage.clear())

  it('shows every game by category with an empty clear summary', () => {
    renderPage()

    const totalGames = GAME_CATEGORY_LIST.reduce((total, category) => total + category.games.length, 0)
    expect(screen.getByRole('heading', { level: 1, name: 'クリア状況' })).toBeInTheDocument()
    expect(screen.getByLabelText(`ぜんぶで ${totalGames}こ中 0こ クリア`)).toBeInTheDocument()
    for (const category of GAME_CATEGORY_LIST) {
      expect(screen.getByRole('heading', { level: 2, name: category.title })).toBeInTheDocument()
    }
    expect(gameItem('ひらがなから えを えらぼう').getByText('未クリア')).toBeInTheDocument()
    expect(gameItem('ぶんを よんで こたえよう').getByText('未クリア')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'クリア状況をリセット' })).not.toBeInTheDocument()
  })

  it('shows cleared and uncleared games without per-question history', () => {
    const storage = makeStorage()
    expect(markGameCleared('quiz', storage)).toEqual({ ok: true })
    expect(markGameCleared('clock', storage)).toEqual({ ok: true })

    renderPage(storage)

    expect(gameItem('ひらがなから えを えらぼう').getByText('✓ クリア済み')).toBeInTheDocument()
    expect(gameItem('とけいを よもう').getByText('✓ クリア済み')).toBeInTheDocument()
    expect(gameItem('しりとり').getByText('未クリア')).toBeInTheDocument()
    expect(screen.queryByLabelText('回答結果')).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'クリア状況をリセット' })).toBeInTheDocument()
  })

  it('cancels resetting and keeps the clear state', async () => {
    const user = userEvent.setup()
    const storage = makeStorage()
    expect(markGameCleared('quiz', storage)).toEqual({ ok: true })
    renderPage(storage)

    const resetTrigger = screen.getByRole('button', { name: 'クリア状況をリセット' })
    await user.click(resetTrigger)
    const dialog = screen.getByRole('dialog', { name: 'クリア状況をリセットしますか？' })
    await user.click(within(dialog).getByRole('button', { name: 'キャンセル' }))

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(gameItem('ひらがなから えを えらぼう').getByText('✓ クリア済み')).toBeInTheDocument()
    expect(resetTrigger).toHaveFocus()
  })

  it('resets all clear states and rescue stages while keeping unrelated storage', async () => {
    const user = userEvent.setup()
    const storage = makeStorage()
    expect(markGameCleared('quiz', storage)).toEqual({ ok: true })
    expect(recordStageResult({
      stageId: 'rescue-1',
      stampCount: 3,
      maxStampCount: 3,
      moves: 5,
      collectedTreasureIds: ['stage-1-ruby'],
    }, ['rescue-1', 'rescue-2'], storage).ok).toBe(true)
    storage.setItem('other.key', 'keep me')
    renderPage(storage)

    await user.click(screen.getByRole('button', { name: 'クリア状況をリセット' }))
    await user.click(screen.getByRole('button', { name: 'リセットする' }))

    expect(gameItem('ひらがなから えを えらぼう').getByText('未クリア')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'クリア状況をリセット' })).not.toBeInTheDocument()
    expect(loadClearProgress(storage)).toEqual([])
    expect(loadRescueProgress(storage, ['rescue-1', 'rescue-2'])).toEqual({
      unlockedStageIds: ['rescue-1'],
      bestStampCountByStage: {},
      bestMovesByStage: {},
      collectedTreasureIds: [],
    })
    expect(storage.getItem('other.key')).toBe('keep me')
  })

  it('keeps clear states and shows an alert when resetting fails', async () => {
    const user = userEvent.setup()
    const storage = makeStorage()
    expect(markGameCleared('quiz', storage)).toEqual({ ok: true })
    storage.removeItem = () => {
      throw new Error('blocked')
    }
    renderPage(storage)

    await user.click(screen.getByRole('button', { name: 'クリア状況をリセット' }))
    await user.click(screen.getByRole('button', { name: 'リセットする' }))

    expect(screen.getByRole('alert')).toHaveTextContent('クリア状況をリセットできませんでした')
    expect(gameItem('ひらがなから えを えらぼう').getByText('✓ クリア済み')).toBeInTheDocument()
  })
})
