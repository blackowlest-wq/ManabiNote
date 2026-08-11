import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { DifficultySelector } from './DifficultySelector'

describe('DifficultySelector', () => {
  it('shows all difficulty options and reports the selected level', async () => {
    const user = userEvent.setup()
    const onSelect = vi.fn()
    render(<DifficultySelector onSelect={onSelect} />)

    expect(screen.getByRole('heading', { name: 'むずかしさを えらぼう' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /かんたん/ })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /ふつう/ })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /むずかしい/ })).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /むずかしい/ }))

    expect(onSelect).toHaveBeenCalledWith('hard')
  })
})
