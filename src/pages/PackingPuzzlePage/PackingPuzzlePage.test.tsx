import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { loadClearProgress } from '../../features/clear-progress/model/clearProgressStorage'
import { PACKING_STAGES, type PackingState } from '../../features/packing-puzzle/model/packingPuzzle'
import { PackingPuzzlePage } from './PackingPuzzlePage'

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

const renderPage = (options: { storage?: Storage; initialStageIndex?: number; initialState?: PackingState } = {}) => render(
  <MemoryRouter future={{ v7_relativeSplatPath: true, v7_startTransition: true }}>
    <PackingPuzzlePage {...options} />
  </MemoryRouter>,
)

describe('PackingPuzzlePage', () => {
  it('lets a child rotate, select, and place cargo to fill the truck', async () => {
    const user = userEvent.setup()
    renderPage()

    expect(screen.getByRole('heading', { level: 1, name: 'ぴったり！にづみ' })).toBeInTheDocument()
    expect(screen.queryByText(/もんだい|正解|不正解/)).not.toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'トラックを だす' }))

    await user.click(screen.getByRole('button', { name: 'えらんだ にもつを まわす' }))
    await user.click(screen.getByRole('button', { name: 'にもつを ばしょ 1に おく' }))
    await user.click(screen.getByRole('button', { name: 'あおい にもつを えらぶ' }))
    await user.click(screen.getByRole('button', { name: 'えらんだ にもつを まわす' }))
    await user.click(screen.getByRole('button', { name: 'にもつを ばしょ 3に おく' }))

    expect(screen.getByRole('heading', { level: 2, name: 'ぴったり はいった！' })).toBeInTheDocument()
    expect(screen.getByText('⭐⭐⭐')).toBeInTheDocument()
  })

  it('records a clear when the final truck is packed', async () => {
    const user = userEvent.setup()
    const storage = makeStorage()
    const finalStageIndex = PACKING_STAGES.length - 1
    const stage = PACKING_STAGES[finalStageIndex]
    const lastPlacement = stage.solution[stage.solution.length - 1]
    const initialState: PackingState = {
      status: 'playing',
      selectedPieceId: lastPlacement.pieceId,
      rotations: Object.fromEntries(stage.solution.map((placement) => [placement.pieceId, placement.rotation])),
      placements: stage.solution.slice(0, -1),
      moveCount: 9,
    }
    renderPage({ storage, initialStageIndex: finalStageIndex, initialState })

    await user.click(screen.getByRole('button', { name: `にもつを ばしょ ${lastPlacement.anchorIndex + 1}に おく` }))

    expect(screen.getByRole('heading', { level: 2, name: 'にづみ マスター！' })).toBeInTheDocument()
    expect(loadClearProgress(storage).map((record) => record.gameId)).toContain('packing-puzzle')
  })
})
