import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, useLocation } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { QuizSessionProvider } from '../../features/quiz/QuizSessionProvider'
import { StrokePracticeProvider } from '../../features/stroke-order/StrokePracticeProvider'
import { HomePage } from './HomePage'

function LocationProbe() {
  const location = useLocation()
  return <output data-testid="location">{location.pathname}</output>
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

    await user.click(screen.getByRole('button', { name: '学習をはじめる' }))

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
})
