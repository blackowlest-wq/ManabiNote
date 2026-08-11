import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { loadClearProgress } from '../../features/clear-progress/model/clearProgressStorage'
import { SHEEP_STAGES, startSheepMove, type SheepDirection, type SheepMoveState } from '../../features/sheep-move/model/sheepMove'
import { SheepMovePage } from './SheepMovePage'

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

const DIRECTION_NAME: Readonly<Record<SheepDirection, string>> = {
  up: 'うえへ すすむ', down: 'したへ すすむ', left: 'ひだりへ すすむ', right: 'みぎへ すすむ',
}

const renderPage = (options: { storage?: Storage; initialState?: SheepMoveState } = {}) => render(
  <MemoryRouter future={{ v7_relativeSplatPath: true, v7_startTransition: true }}>
    <SheepMovePage {...options} />
  </MemoryRouter>,
)

describe('SheepMovePage', () => {
  it('turns pushing the sheep into the pen into the board objective', async () => {
    const user = userEvent.setup()
    renderPage()

    expect(screen.getByRole('heading', { level: 1, name: 'ひつじの おひっこし' })).toBeInTheDocument()
    expect(screen.queryByText(/もんだい|正解|不正解/)).not.toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'ぼくじょうへ' }))

    for (let index = 0; index < 3; index += 1) await user.click(screen.getByRole('button', { name: 'みぎへ すすむ' }))

    expect(screen.getByRole('heading', { level: 2, name: 'みんな おうちに ついた！' })).toBeInTheDocument()
  })

  it('records a clear after moving the last flock home', async () => {
    const user = userEvent.setup()
    const storage = makeStorage()
    const finalStageIndex = SHEEP_STAGES.length - 1
    renderPage({ storage, initialState: startSheepMove(finalStageIndex) })

    for (const direction of SHEEP_STAGES[finalStageIndex].solution) {
      await user.click(screen.getByRole('button', { name: DIRECTION_NAME[direction] }))
    }

    expect(screen.getByRole('heading', { level: 2, name: 'ひつじマスター！' })).toBeInTheDocument()
    await waitFor(() => expect(loadClearProgress(storage).map((record) => record.gameId)).toContain('sheep-move'))
  })
})
