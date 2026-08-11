import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { loadClearProgress } from '../../features/clear-progress/model/clearProgressStorage'
import { BRIDGE_STAGES, startBridgeBuilder, type BridgeBuilderState } from '../../features/bridge-builder/model/bridgeBuilder'
import { BridgeBuilderPage } from './BridgeBuilderPage'

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

const renderPage = (options: { storage?: Storage; initialState?: BridgeBuilderState } = {}) => render(
  <MemoryRouter future={{ v7_relativeSplatPath: true, v7_startTransition: true }}>
    <BridgeBuilderPage {...options} />
  </MemoryRouter>,
)

describe('BridgeBuilderPage', () => {
  it('makes fitting logs across the river the main puzzle', async () => {
    const user = userEvent.setup()
    renderPage()

    expect(screen.getByRole('heading', { level: 1, name: 'ぽんぽこ 橋づくり' })).toBeInTheDocument()
    expect(screen.queryByText(/もんだい|正解|不正解/)).not.toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'かわへ しゅっぱつ' }))

    await user.click(screen.getByRole('button', { name: 'ながさ 1の まるた 1' }))
    await user.click(screen.getByRole('button', { name: 'ながさ 2の まるた 2' }))

    expect(screen.getByRole('heading', { level: 2, name: 'はしが つながった！' })).toBeInTheDocument()
  })

  it('records a clear when the last bridge reaches the far bank', async () => {
    const user = userEvent.setup()
    const storage = makeStorage()
    const finalStageIndex = BRIDGE_STAGES.length - 1
    const finalStage = BRIDGE_STAGES[finalStageIndex]
    const placedLogIds = finalStage.solution.slice(0, -1)
    const builtLength = placedLogIds.reduce((total, id) => total + (finalStage.logs.find((log) => log.id === id)?.length ?? 0), 0)
    const lastLogId = finalStage.solution[finalStage.solution.length - 1]
    const lastLogIndex = finalStage.logs.findIndex((log) => log.id === lastLogId)
    const lastLog = finalStage.logs[lastLogIndex]
    const initialState: BridgeBuilderState = {
      ...startBridgeBuilder(finalStageIndex),
      placedLogIds,
      builtLength,
      totalStars: 15,
      score: 4000,
    }
    renderPage({ storage, initialState })

    await user.click(screen.getByRole('button', { name: `ながさ ${lastLog.length}の まるた ${lastLogIndex + 1}` }))

    expect(screen.getByRole('heading', { level: 2, name: 'はしづくり マスター！' })).toBeInTheDocument()
    await waitFor(() => expect(loadClearProgress(storage).map((record) => record.gameId)).toContain('bridge-builder'))
  })
})
