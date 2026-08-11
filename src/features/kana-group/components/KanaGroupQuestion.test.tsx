import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import type { KanaGroupQuestion as KanaGroupQuestionData } from '../model/types'
import { KanaGroupQuestion } from './KanaGroupQuestion'

const question: KanaGroupQuestionData = {
  id: 'kana-group-き',
  targetCharacter: 'き',
  groupId: 'ka',
  choices: [
    { id: 'choice-ka', label: 'かきくけこ' },
    { id: 'choice-a', label: 'あいうえお' },
    { id: 'choice-sa', label: 'さしすせそ' },
    { id: 'choice-ta', label: 'たちつてと' },
  ],
  correctChoiceId: 'choice-ka',
}

describe('KanaGroupQuestion', () => {
  it('shows the target character and group choices', () => {
    render(<KanaGroupQuestion question={question} selectedChoiceId={null} feedback="none" onSelect={vi.fn()} />)

    expect(screen.getByRole('heading', { name: 'き' })).toBeInTheDocument()
    expect(screen.getByRole('group', { name: 'かなのなかまをえらぶ' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'かきくけこのなかま' })).toBeEnabled()
  })

  it('notifies a choice and locks choices after a correct answer', async () => {
    const user = userEvent.setup()
    const onSelect = vi.fn()
    const { rerender } = render(<KanaGroupQuestion question={question} selectedChoiceId={null} feedback="none" onSelect={onSelect} />)

    await user.click(screen.getByRole('button', { name: 'かきくけこのなかま' }))
    expect(onSelect).toHaveBeenCalledWith('choice-ka')

    rerender(<KanaGroupQuestion question={question} selectedChoiceId="choice-ka" feedback="correct" onSelect={onSelect} />)
    expect(screen.getByText('せいかい！')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'かきくけこのなかま' })).toBeDisabled()
  })

  it('keeps choices enabled after an incorrect answer', () => {
    render(<KanaGroupQuestion question={question} selectedChoiceId="choice-a" feedback="incorrect" onSelect={vi.fn()} />)

    expect(screen.getByText('もういちど えらんでね')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'かきくけこのなかま' })).toBeEnabled()
  })
})
