import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import type { NumberOrderQuestion as NumberOrderQuestionData } from '../model/types'
import { NumberOrderQuestion } from './NumberOrderQuestion'

const question: NumberOrderQuestionData = {
  id: 'number-order-1-5',
  sequence: [1, 2, null, 4, 5],
  answer: 3,
  choices: [
    { id: 'choice-3', value: 3 },
    { id: 'choice-6', value: 6 },
    { id: 'choice-7', value: 7 },
    { id: 'choice-8', value: 8 },
  ],
  correctChoiceId: 'choice-3',
}

describe('NumberOrderQuestion', () => {
  it('shows the sequence and missing-number choices', () => {
    render(<NumberOrderQuestion question={question} selectedChoiceId={null} feedback="none" onSelect={vi.fn()} />)

    expect(screen.getByText('？に はいる かずは どれ？')).toBeInTheDocument()
    expect(screen.getByRole('group', { name: 'かずの じゅんばん' })).toBeInTheDocument()
    expect(screen.getByRole('group', { name: 'つぎのかずをえらぶ' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '3' })).toBeEnabled()
  })

  it('calls the choice handler and locks after a correct answer', async () => {
    const user = userEvent.setup()
    const onSelect = vi.fn()
    const { rerender } = render(<NumberOrderQuestion question={question} selectedChoiceId={null} feedback="none" onSelect={onSelect} />)

    await user.click(screen.getByRole('button', { name: '3' }))
    expect(onSelect).toHaveBeenCalledWith('choice-3')

    rerender(<NumberOrderQuestion question={question} selectedChoiceId="choice-3" feedback="correct" onSelect={onSelect} />)
    expect(screen.getByText('せいかい！')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '3' })).toBeDisabled()
  })
})
