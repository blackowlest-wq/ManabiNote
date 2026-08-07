import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, useLocation } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { QuizSessionProvider } from '../../features/quiz/QuizSessionProvider'
import { loadStrokeQuestionsForRow } from '../../features/question-types/kana-to-stroke/model/loader'
import { StrokePracticeProvider, useStrokePractice } from '../../features/stroke-order/StrokePracticeProvider'
import { createPracticeSession } from '../../features/stroke-order/model/practiceSession'
import { HomePage } from './HomePage'

function LocationProbe() {
  const location = useLocation()
  return <output data-testid="location">{location.pathname}</output>
}

function StrokeSessionProbe() {
  const { session } = useStrokePractice()
  return <output data-testid="stroke-session-status">{session?.status ?? 'none'}</output>
}

describe('HomePage', () => {
  it('starts a new quiz and navigates to the quiz page', async () => {
    const user = userEvent.setup()
    render(
      <MemoryRouter>
        <QuizSessionProvider>
          <StrokePracticeProvider>
            <HomePage />
            <LocationProbe />
          </StrokePracticeProvider>
        </QuizSessionProvider>
      </MemoryRouter>,
    )

    expect(screen.getByTestId('home-actions')).toHaveClass('home-actions')

    await user.click(screen.getByRole('button', { name: 'ひらがなから えを えらぼう' }))

    expect(screen.getByTestId('location')).toHaveTextContent('/quiz')
  })

  it('starts stroke practice and navigates to the stroke order page', async () => {
    const user = userEvent.setup()
    render(
      <MemoryRouter>
        <QuizSessionProvider>
          <StrokePracticeProvider>
            <HomePage />
            <LocationProbe />
          </StrokePracticeProvider>
        </QuizSessionProvider>
      </MemoryRouter>,
    )

    await user.click(screen.getByRole('button', { name: '書き順れんしゅう' }))

    expect(screen.getByTestId('location')).toHaveTextContent('/stroke-order')
  })

  it('shows a separate word builder game link', () => {
    render(
      <MemoryRouter>
        <QuizSessionProvider>
          <StrokePracticeProvider>
            <HomePage />
          </StrokePracticeProvider>
        </QuizSessionProvider>
      </MemoryRouter>,
    )

    expect(screen.getByRole('link', { name: 'ことばをつくろう' })).toHaveAttribute('href', '/word-builder')
  })

  it('clears an existing stroke session before entering row selection', async () => {
    const user = userEvent.setup()
    const initialSession = createPracticeSession(
      loadStrokeQuestionsForRow('a'),
      'a',
      () => new Date('2026-07-31T10:00:00.000Z'),
    )
    render(
      <MemoryRouter>
        <QuizSessionProvider>
          <StrokePracticeProvider initialSession={initialSession}>
            <HomePage />
            <StrokeSessionProbe />
            <LocationProbe />
          </StrokePracticeProvider>
        </QuizSessionProvider>
      </MemoryRouter>,
    )

    expect(screen.getByTestId('stroke-session-status')).toHaveTextContent('active')

    await user.click(screen.getByRole('button', { name: '書き順れんしゅう' }))

    expect(screen.getByTestId('stroke-session-status')).toHaveTextContent('none')
    expect(screen.getByTestId('location')).toHaveTextContent('/stroke-order')
  })
})
