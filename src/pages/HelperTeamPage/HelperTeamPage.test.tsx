import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { loadClearProgress } from '../../features/clear-progress/model/clearProgressStorage'
import { HELPER_TEAM_STAGES, startHelperTeam, type HelperKind, type HelperTeamState } from '../../features/helper-team/model/helperTeam'
import { HelperTeamPage } from './HelperTeamPage'

const makeStorage = (): Storage => {
  const values = new Map<string, string>()
  return {
    get length() { return values.size }, clear: () => values.clear(),
    getItem: (key) => values.get(key) ?? null, key: (index) => Array.from(values.keys())[index] ?? null,
    removeItem: (key) => void values.delete(key), setItem: (key, value) => void values.set(key, value),
  }
}

const HELPER_NAME: Readonly<Record<HelperKind, string>> = {
  beaver: 'ビーバー', rabbit: 'うさぎ', elephant: 'ぞう', mole: 'もぐら', monkey: 'さる',
}

const renderPage = (options: { storage?: Storage; initialState?: HelperTeamState } = {}) => render(
  <MemoryRouter future={{ v7_relativeSplatPath: true, v7_startTransition: true }}>
    <HelperTeamPage {...options} />
  </MemoryRouter>,
)

describe('HelperTeamPage', () => {
  it('makes planning a capable team the expedition itself instead of a quiz', async () => {
    const user = userEvent.setup()
    renderPage()

    expect(screen.getByRole('heading', { level: 1, name: 'どうぶつ おたすけ隊' })).toBeInTheDocument()
    expect(screen.queryByText(/もんだい|正解|不正解/)).not.toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'ぼうけんへ しゅっぱつ' }))
    await user.click(screen.getByRole('button', { name: 'ビーバーを チームに いれる' }))
    await user.click(screen.getByRole('button', { name: 'チームで しゅっぱつ' }))

    expect(screen.getByRole('heading', { level: 2, name: 'ぼうけん せいこう！' })).toBeInTheDocument()
  })

  it('records a clear after the final team completes its expedition', async () => {
    const user = userEvent.setup()
    const storage = makeStorage()
    const finalStageIndex = HELPER_TEAM_STAGES.length - 1
    renderPage({ storage, initialState: startHelperTeam(finalStageIndex) })

    for (const helper of HELPER_TEAM_STAGES[finalStageIndex].solution) {
      await user.click(screen.getByRole('button', { name: `${HELPER_NAME[helper]}を チームに いれる` }))
    }
    await user.click(screen.getByRole('button', { name: 'チームで しゅっぱつ' }))

    expect(screen.getByRole('heading', { level: 2, name: 'おたすけ隊 マスター！' })).toBeInTheDocument()
    await waitFor(() => expect(loadClearProgress(storage).map((record) => record.gameId)).toContain('helper-team'))
  })
})
