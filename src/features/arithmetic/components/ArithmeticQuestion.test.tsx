import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import type { ArithmeticQuestion as ArithmeticQuestionData } from '../model/types'
import { ArithmeticQuestion } from './ArithmeticQuestion'

const question: ArithmeticQuestionData = {
  id: 'addition-2-3',
  kind: 'addition',
  left: 2,
  right: 3,
  answer: 5,
  choices: [
    { id: 'choice-5', value: 5 },
    { id: 'choice-4', value: 4 },
    { id: 'choice-6', value: 6 },
    { id: 'choice-7', value: 7 },
  ],
  correctChoiceId: 'choice-5',
}

describe('ArithmeticQuestion', () => {
  it('shows the expression and answer choices', () => {
    render(<ArithmeticQuestion question={question} selectedChoiceId={null} feedback="none" onSelect={vi.fn()} />)

    expect(screen.getByLabelText('2 ＋ 3 は いくつ')).toBeInTheDocument()
    expect(screen.getByRole('group', { name: 'こたえをえらぶ' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '5' })).toBeEnabled()
  })

  it('selects an answer and locks after it is correct', async () => {
    const user = userEvent.setup()
    const onSelect = vi.fn()
    const { rerender } = render(<ArithmeticQuestion question={question} selectedChoiceId={null} feedback="none" onSelect={onSelect} />)

    await user.click(screen.getByRole('button', { name: '5' }))
    expect(onSelect).toHaveBeenCalledWith('choice-5')

    rerender(<ArithmeticQuestion question={question} selectedChoiceId="choice-5" feedback="correct" onSelect={onSelect} />)
    expect(screen.getByText('せいかい！')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '5' })).toBeDisabled()
  })
})
