import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import type { NumberCompareQuestion as NumberCompareQuestionData } from '../model/types'
import { NumberCompareQuestion } from './NumberCompareQuestion'

const question: NumberCompareQuestionData = {
  id: 'number-compare-1-3',
  left: 1,
  right: 3,
  choices: [
    { id: 'choice-right', side: 'right', value: 3 },
    { id: 'choice-left', side: 'left', value: 1 },
  ],
  correctChoiceId: 'choice-right',
}

describe('NumberCompareQuestion', () => {
  it('shows the two numbers and choices', () => {
    render(<NumberCompareQuestion question={question} selectedChoiceId={null} feedback="none" onSelect={vi.fn()} />)

    expect(screen.getByText('おおきい かずは どれ？')).toBeInTheDocument()
    expect(screen.getByRole('group', { name: 'くらべる かず' })).toBeInTheDocument()
    expect(screen.getByRole('group', { name: 'おおきいかずをえらぶ' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '3' })).toBeEnabled()
  })

  it('calls the choice handler and locks after a correct answer', async () => {
    const user = userEvent.setup()
    const onSelect = vi.fn()
    const { rerender } = render(<NumberCompareQuestion question={question} selectedChoiceId={null} feedback="none" onSelect={onSelect} />)

    await user.click(screen.getByRole('button', { name: '3' }))
    expect(onSelect).toHaveBeenCalledWith('choice-right')

    rerender(<NumberCompareQuestion question={question} selectedChoiceId="choice-right" feedback="correct" onSelect={onSelect} />)
    expect(screen.getByText('せいかい！')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '3' })).toBeDisabled()
  })
})
