import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { loadClearProgress } from '../../features/clear-progress/model/clearProgressStorage'
import { ROBOT_STAGES, type RobotRouteState } from '../../features/robot-route/model/robotRoute'
import { RobotRoutePage } from './RobotRoutePage'

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

const renderPage = (options: { storage?: Storage; initialStageIndex?: number; initialState?: RobotRouteState } = {}) => render(
  <MemoryRouter future={{ v7_relativeSplatPath: true, v7_startTransition: true }}>
    <RobotRoutePage {...options} />
  </MemoryRouter>,
)

describe('RobotRoutePage', () => {
  it('queues directions and launches the robot as a planned route', async () => {
    const user = userEvent.setup()
    renderPage()

    expect(screen.getByRole('heading', { level: 1, name: 'ロボット GO！' })).toBeInTheDocument()
    expect(screen.queryByText(/もんだい|正解|不正解/)).not.toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'ミッション スタート' }))

    await user.click(screen.getByRole('button', { name: 'みぎを ついか' }))
    await user.click(screen.getByRole('button', { name: 'みぎを ついか' }))
    expect(screen.getByLabelText('うごきの よやく')).toHaveTextContent('→→')
    await user.click(screen.getByRole('button', { name: 'ロボット しゅっぱつ' }))

    expect(screen.getByRole('heading', { level: 2, name: 'ミッション クリア！' })).toBeInTheDocument()
    expect(screen.getByText('⭐⭐⭐')).toBeInTheDocument()
  })

  it('records a clear when the final robot mission succeeds', async () => {
    const user = userEvent.setup()
    const storage = makeStorage()
    const finalStageIndex = ROBOT_STAGES.length - 1
    const stage = ROBOT_STAGES[finalStageIndex]
    const initialState: RobotRouteState = {
      status: 'planning',
      position: stage.startIndex,
      commands: stage.solution,
      collectedBatteryIndexes: [],
      trace: [stage.startIndex],
      attemptCount: 0,
      failureReason: null,
    }
    renderPage({ storage, initialStageIndex: finalStageIndex, initialState })

    await user.click(screen.getByRole('button', { name: 'ロボット しゅっぱつ' }))

    expect(screen.getByRole('heading', { level: 2, name: 'ロボット マスター！' })).toBeInTheDocument()
    expect(loadClearProgress(storage).map((record) => record.gameId)).toContain('robot-route')
  })
})
