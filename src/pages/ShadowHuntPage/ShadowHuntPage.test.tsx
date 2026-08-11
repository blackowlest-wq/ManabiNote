import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { loadClearProgress } from '../../features/clear-progress/model/clearProgressStorage'
import { SHADOW_HUNT_CLEAR_TARGET, startShadowHunt, type ShadowHuntState } from '../../features/shadow-hunt/model/shadowHunt'
import { ShadowHuntPage } from './ShadowHuntPage'

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

const renderPage = (options: { storage?: Storage; initialState?: ShadowHuntState } = {}) => render(
  <MemoryRouter future={{ v7_relativeSplatPath: true, v7_startTransition: true }}>
    <ShadowHuntPage random={alwaysFirst} {...options} />
  </MemoryRouter>,
)

describe('ShadowHuntPage', () => {
  it('turns silhouette matching into a monster capture hunt', async () => {
    const user = userEvent.setup()
    renderPage()

    expect(screen.getByRole('heading', { level: 1, name: 'シルエットハンター' })).toBeInTheDocument()
    expect(screen.queryByText(/もんだい|正解|不正解/)).not.toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'もりへ しゅっぱつ' }))

    expect(screen.getByLabelText('さがす モンスターの かげ')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'スライムを つかまえる' }))

    expect(screen.getByRole('status')).toHaveTextContent('スライムを つかまえた！')
    expect(screen.getByLabelText('つかまえた かず')).toHaveTextContent('1')
  })

  it('records a clear when the sixth monster is captured', async () => {
    const user = userEvent.setup()
    const storage = makeStorage()
    const initialState: ShadowHuntState = {
      ...startShadowHunt({}, alwaysFirst),
      captureCount: SHADOW_HUNT_CLEAR_TARGET - 1,
      score: 500,
    }
    renderPage({ storage, initialState })

    await user.click(screen.getByRole('button', { name: 'スライムを つかまえる' }))

    expect(screen.getByRole('heading', { level: 2, name: 'ハンターランク クリア！' })).toBeInTheDocument()
    expect(loadClearProgress(storage).map((record) => record.gameId)).toContain('shadow-hunt')
  })
})
