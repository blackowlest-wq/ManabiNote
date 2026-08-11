import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { loadClearProgress } from '../../features/clear-progress/model/clearProgressStorage'
import { SHAPE_CATCHER_STAGES, startShapeCatcher } from '../../features/shape-catcher/model/shapeCatcher'
import { ShapeCatcherPage } from './ShapeCatcherPage'

const storage = (): Storage => { const values = new Map<string, string>(); return { get length() { return values.size }, clear: () => values.clear(), getItem: k => values.get(k) ?? null, key: i => [...values.keys()][i] ?? null, removeItem: k => void values.delete(k), setItem: (k, v) => void values.set(k, v) } }
const renderPage = (props = {}) => render(<MemoryRouter future={{ v7_relativeSplatPath: true, v7_startTransition: true }}><ShapeCatcherPage {...props} /></MemoryRouter>)

describe('ShapeCatcherPage', () => {
  it('makes rotating live catchers the game itself', async () => {
    const user = userEvent.setup(); renderPage()
    expect(screen.queryByText(/もんだい|正解|不正解/)).not.toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'キャッチ スタート！' }))
    await user.click(screen.getByRole('button', { name: 'ぼうの うけざらを まわす' }))
    expect(screen.getByRole('button', { name: 'ぼうの うけざらを まわす' })).toHaveAttribute('data-rotation', '1')
  })

  it('records a clear after catching the final shape', async () => {
    const store = storage(); const stageIndex = SHAPE_CATCHER_STAGES.length - 1; const stage = SHAPE_CATCHER_STAGES[stageIndex]; const pieceIndex = stage.pieces.length - 1; const piece = stage.pieces[pieceIndex]
    renderPage({ storage: store, initialState: { ...startShapeCatcher(stageIndex), pieceIndex, fall: 1, rotations: { bar: 0, corner: 0, tee: 0, [piece.kind]: piece.rotation } } })
    expect(await screen.findByRole('heading', { name: 'かたちキャッチ マスター！' }, { timeout: 1800 })).toBeInTheDocument()
    await waitFor(() => expect(loadClearProgress(store).some(item => item.gameId === 'shape-catcher')).toBe(true))
  })
})
