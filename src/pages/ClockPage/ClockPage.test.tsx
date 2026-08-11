import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { ClockSessionProvider } from '../../features/clock/ClockSessionProvider'
import { createClockQuestions } from '../../features/clock/model/clockQuestion'
import { createClockSession } from '../../features/clock/model/clockSession'
import { ClockPage } from './ClockPage'

const session = createClockSession(
  'easy',
  createClockQuestions('easy', () => 0.999),
  () => new Date('2026-08-11T10:00:00.000Z'),
  () => 0.999,
)

const renderPage = (initialSession = session) => render(
  <MemoryRouter initialEntries={['/clock']}>
    <ClockSessionProvider initialSession={initialSession}>
      <Routes>
        <Route path="/clock" element={<ClockPage />} />
        <Route path="/clock/result" element={<p>けっかページ</p>} />
      </Routes>
    </ClockSessionProvider>
  </MemoryRouter>,
)

describe('ClockPage', () => {
  it('starts a selected difficulty from the menu', async () => {
    const user = userEvent.setup()
    render(
      <MemoryRouter initialEntries={['/clock']}>
        <ClockSessionProvider>
          <Routes><Route path="/clock" element={<ClockPage />} /></Routes>
        </ClockSessionProvider>
      </MemoryRouter>,
    )

    await user.click(screen.getByRole('button', { name: /かんたん/ }))

    expect(await screen.findByText('1 / 5')).toBeInTheDocument()
    expect(screen.getByRole('img', { name: /^とけい/ })).toBeInTheDocument()
  })

  it('advances after the correct time is selected', async () => {
    const user = userEvent.setup()
    const question = session.questions[0]
    if (!question) throw new Error('問題がありません')
    const correctChoice = question.choices.find((choice) => choice.id === question.correctChoiceId)
    if (!correctChoice) throw new Error('正解がありません')
    renderPage()

    await user.click(screen.getByRole('button', { name: correctChoice.label }))
    await user.click(screen.getByRole('button', { name: 'つぎへ' }))

    expect(screen.getByText('2 / 5')).toBeInTheDocument()
  })
})
