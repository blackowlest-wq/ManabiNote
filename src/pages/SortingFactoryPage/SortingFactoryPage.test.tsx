import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { loadClearProgress } from '../../features/clear-progress/model/clearProgressStorage'
import { SORTING_LEVELS, SORTING_LEVEL_TARGET, startSortingFactory, type SortingFactoryState } from '../../features/sorting-factory/model/sortingFactory'
import { SortingFactoryPage } from './SortingFactoryPage'

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

const renderPage = (options: { storage?: Storage; initialState?: SortingFactoryState } = {}) => render(
  <MemoryRouter future={{ v7_relativeSplatPath: true, v7_startTransition: true }}>
    <SortingFactoryPage random={alwaysFirst} {...options} />
  </MemoryRouter>,
)

describe('SortingFactoryPage', () => {
  it('makes sorting the moving item the main action', async () => {
    const user = userEvent.setup()
    renderPage()

    expect(screen.getByRole('heading', { level: 1, name: 'ぽんぽん しわけ工場' })).toBeInTheDocument()
    expect(screen.queryByText(/もんだい|正解|不正解/)).not.toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'こうじょうを うごかす' }))

    expect(screen.getByLabelText('ながれている もの')).toHaveTextContent('🍎')
    await user.click(screen.getByRole('button', { name: 'たべものの はこへ いれる' }))

    expect(screen.getByRole('status')).toHaveTextContent('ぽん！ しわけ せいこう！')
    expect(screen.getByLabelText('しわけた かず')).toHaveTextContent('1')
  })

  it('records a clear after the final factory belt', async () => {
    const user = userEvent.setup()
    const storage = makeStorage()
    const finalLevelIndex = SORTING_LEVELS.length - 1
    const finalLevel = SORTING_LEVELS[finalLevelIndex]
    const item = finalLevel.items[0]
    const initialState: SortingFactoryState = {
      ...startSortingFactory(alwaysFirst),
      levelIndex: finalLevelIndex,
      currentItemId: item.id,
      sortedInLevel: SORTING_LEVEL_TARGET - 1,
      totalSorted: SORTING_LEVEL_TARGET * SORTING_LEVELS.length - 1,
    }
    renderPage({ storage, initialState })

    await user.click(screen.getByRole('button', { name: `${item.side === 'left' ? finalLevel.leftLabel : finalLevel.rightLabel}の はこへ いれる` }))

    expect(screen.getByRole('heading', { level: 2, name: 'こうじょうマスター！' })).toBeInTheDocument()
    await waitFor(() => expect(loadClearProgress(storage).map((record) => record.gameId)).toContain('sorting-factory'))
  })
})
