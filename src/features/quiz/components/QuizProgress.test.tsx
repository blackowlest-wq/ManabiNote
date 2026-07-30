import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { QuizProgress } from './QuizProgress'

describe('QuizProgress', () => {
  it('renders the current question and total', () => {
    render(<QuizProgress current={2} total={5} />)

    expect(screen.getByText('2 / 5')).toBeInTheDocument()
  })
})
