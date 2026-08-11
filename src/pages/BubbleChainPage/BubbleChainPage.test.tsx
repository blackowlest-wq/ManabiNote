import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { BUBBLE_CHAIN_STAGES, startBubbleChain } from '../../features/bubble-chain/model/bubbleChain'
import { loadClearProgress } from '../../features/clear-progress/model/clearProgressStorage'
import { BubbleChainPage } from './BubbleChainPage'

const storage = (): Storage => { const v = new Map<string, string>(); return { get length() { return v.size }, clear: () => v.clear(), getItem: k => v.get(k) ?? null, key: i => [...v.keys()][i] ?? null, removeItem: k => void v.delete(k), setItem: (k, x) => void v.set(k, x) } }
const renderPage = (props = {}) => render(<MemoryRouter><BubbleChainPage {...props} /></MemoryRouter>)

describe('BubbleChainPage', () => {
  it('turns a tap into a visible full-board chain instead of a quiz', async () => {
    const user = userEvent.setup(); renderPage()
    expect(screen.queryByText(/もんだい|正解|不正解/)).not.toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'バブルの うみへ' }))
    await user.click(screen.getByRole('button', { name: 'バブル 1、あと 1' }))
    expect(screen.getByRole('heading', { name: 'ぜんぶ はじけた！' })).toBeInTheDocument()
  })

  it('records a clear after the final chain', async () => {
    const user = userEvent.setup(); const store = storage(); const i = BUBBLE_CHAIN_STAGES.length - 1
    renderPage({ storage: store, initialState: startBubbleChain(i) })
    for (const index of BUBBLE_CHAIN_STAGES[i].solution) await user.click(screen.getByRole('button', { name: new RegExp(`^バブル ${index + 1}、`) }))
    expect(screen.getByRole('heading', { name: 'バブルれんさ マスター！' })).toBeInTheDocument()
    await waitFor(() => expect(loadClearProgress(store).some(x => x.gameId === 'bubble-chain')).toBe(true))
  })
})
