import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { ClockSessionProvider } from '../../features/clock/ClockSessionProvider'
import { createClockQuestions } from '../../features/clock/model/clockQuestion'
import { createClockSession } from '../../features/clock/model/clockSession'
import { ClockResultPage } from './ClockResultPage'

const session = createClockSession(
  'hard',
  createClockQuestions('hard', () => 0.999),
  () => new Date('2026-08-11T10:00:00.000Z'),
  () => 0.999,
)
const completedSession = { ...session, currentIndex: session.questions.length }

describe('ClockResultPage', () => {
  it('shows the completed difficulty', () => {
    render(
      <MemoryRouter>
        <ClockSessionProvider initialSession={completedSession}><ClockResultPage /></ClockSessionProvider>
      </MemoryRouter>,
    )

    expect(screen.getByRole('heading', { name: 'とけいの れんしゅう おわり！' })).toBeInTheDocument()
    expect(screen.getByText('むずかしさ：むずかしい')).toBeInTheDocument()
  })
})
