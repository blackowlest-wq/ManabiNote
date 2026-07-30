import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, useLocation } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { QuizSessionProvider } from '../../features/quiz/QuizSessionProvider'
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
          <HomePage />
          <LocationProbe />
        </QuizSessionProvider>
      </MemoryRouter>,
    )

    await user.click(screen.getByRole('button', { name: '学習をはじめる' }))

    expect(screen.getByTestId('location')).toHaveTextContent('/quiz')
  })
})
