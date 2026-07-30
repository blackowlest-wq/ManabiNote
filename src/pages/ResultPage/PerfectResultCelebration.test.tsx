import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { PerfectResultCelebration } from './PerfectResultCelebration'

describe('PerfectResultCelebration', () => {
  it('shows the perfect-score message and decorative effects', () => {
    render(<PerfectResultCelebration />)

    expect(screen.getByRole('status')).toHaveTextContent('ぜんもんせいかい！')
    expect(screen.getByTestId('perfect-result-stars')).toHaveAttribute('aria-hidden', 'true')
    expect(screen.getByTestId('perfect-result-confetti')).toHaveAttribute('aria-hidden', 'true')
  })
})
