import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { loadClearProgress } from '../../features/clear-progress/model/clearProgressStorage'
import type { MonsterMergeState } from '../../features/monster-merge/model/monsterMerge'
import { MonsterMergePage } from './MonsterMergePage'

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

const renderPage = (options: { storage?: Storage; initialState?: MonsterMergeState } = {}) => render(
  <MemoryRouter future={{ v7_relativeSplatPath: true, v7_startTransition: true }}>
    <MonsterMergePage random={alwaysFirst} {...options} />
  </MemoryRouter>,
)

describe('MonsterMergePage', () => {
  it('lets a child merge monsters with large direction controls', async () => {
    const user = userEvent.setup()
    renderPage()

    expect(screen.getByRole('heading', { level: 1, name: 'モンスター合体' })).toBeInTheDocument()
    expect(screen.queryByText(/もんだい|正解|不正解/)).not.toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'たんけんを はじめる' }))

    expect(screen.getByRole('grid', { name: 'モンスターの しま' })).toBeInTheDocument()
    expect(screen.getAllByRole('gridcell')).toHaveLength(16)
    await user.click(screen.getByRole('button', { name: 'ひだりへ うごかす' }))

    expect(screen.getByRole('status')).toHaveTextContent('ひよこを はっけん！')
    expect(screen.getByLabelText('20てん')).toBeInTheDocument()
    expect(screen.getByLabelText('1コンボ')).toBeInTheDocument()
  })

  it('records a clear when a dragon is born', async () => {
    const user = userEvent.setup()
    const storage = makeStorage()
    const initialState: MonsterMergeState = {
      status: 'playing',
      board: [4, 4, null, null, ...Array(12).fill(null)],
      score: 120,
      combo: 2,
      bestCombo: 2,
      highestLevel: 4,
      discoveredLevels: [1, 2, 3, 4],
      moveCount: 8,
    }
    renderPage({ storage, initialState })

    await user.click(screen.getByRole('button', { name: 'ひだりへ うごかす' }))

    expect(screen.getByRole('heading', { level: 2, name: 'ドラゴン たんじょう！' })).toBeInTheDocument()
    expect(loadClearProgress(storage).map((record) => record.gameId)).toContain('monster-merge')
  })
})
