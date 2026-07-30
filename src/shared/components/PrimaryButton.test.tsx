import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { PrimaryButton } from './PrimaryButton'

describe('PrimaryButton', () => {
  it('exposes its accessible name and preserves disabled state', () => {
    render(<PrimaryButton disabled>学習をはじめる</PrimaryButton>)

    expect(screen.getByRole('button', { name: '学習をはじめる' })).toBeDisabled()
  })

  it('marks the button as focus-ring ready for keyboard focus styling', async () => {
    const user = userEvent.setup()
    render(<PrimaryButton>つぎへ</PrimaryButton>)

    const button = screen.getByRole('button', { name: 'つぎへ' })
    await user.tab()

    expect(button).toHaveFocus()
    expect(button).toHaveAttribute('data-focus-ring', 'true')
  })
})
