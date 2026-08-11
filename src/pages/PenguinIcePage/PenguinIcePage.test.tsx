import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { loadClearProgress } from '../../features/clear-progress/model/clearProgressStorage'
import { PENGUIN_ICE_STAGES, startPenguinIce } from '../../features/penguin-ice/model/penguinIce'
import { PenguinIcePage } from './PenguinIcePage'

const storage = (): Storage => { const v = new Map<string, string>(); return { get length() { return v.size }, clear: () => v.clear(), getItem: k => v.get(k) ?? null, key: i => [...v.keys()][i] ?? null, removeItem: k => void v.delete(k), setItem: (k, x) => void v.set(k, x) } }
const renderPage = (props = {}) => render(<MemoryRouter future={{ v7_relativeSplatPath: true, v7_startTransition: true }}><PenguinIcePage {...props} /></MemoryRouter>)

describe('PenguinIcePage', () => {
  it('makes route choice and fish totals the competition itself', async () => {
    const user = userEvent.setup(); renderPage()
    expect(screen.queryByText(/もんだい|正解|不正解/)).not.toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'こおりの しまへ' }))
    for (const index of PENGUIN_ICE_STAGES[0].solution) await user.click(screen.getByRole('button', { name: new RegExp(`^こおり ${index + 1}、`) }))
    expect(screen.getByRole('heading', { name: 'ペンギンの かち！' })).toBeInTheDocument()
  })

  it('records a clear after winning the final island', async () => {
    const user = userEvent.setup(); const store = storage(); const i = PENGUIN_ICE_STAGES.length - 1
    renderPage({ storage: store, initialState: startPenguinIce(i) })
    for (const index of PENGUIN_ICE_STAGES[i].solution) await user.click(screen.getByRole('button', { name: new RegExp(`^こおり ${index + 1}、`) }))
    expect(screen.getByRole('heading', { name: 'こおりとり マスター！' })).toBeInTheDocument()
    await waitFor(() => expect(loadClearProgress(store).some(x => x.gameId === 'penguin-ice')).toBe(true))
  })
})
