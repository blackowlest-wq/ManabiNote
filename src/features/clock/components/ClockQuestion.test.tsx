import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import type { ClockQuestion as ClockQuestionData } from '../model/types'
import { ClockQuestion } from './ClockQuestion'

const question: ClockQuestionData = {
  id: 'clock-test',
  hour: 3,
  minute: 0,
  choices: [
    { id: 'choice-3', hour: 3, minute: 0, label: '3じ' },
    { id: 'choice-4', hour: 4, minute: 0, label: '4じ' },
    { id: 'choice-315', hour: 3, minute: 15, label: '3じ 15ふん' },
    { id: 'choice-230', hour: 2, minute: 30, label: '2じ 30ぷん' },
  ],
  correctChoiceId: 'choice-3',
}

describe('ClockQuestion', () => {
  it('shows an analog clock and time choices', () => {
    render(<ClockQuestion question={question} selectedChoiceId={null} feedback="none" onSelect={vi.fn()} />)

    expect(screen.getByRole('img', { name: 'とけい 3じ' })).toBeInTheDocument()
    expect(screen.getByRole('group', { name: 'じこくをえらぶ' })).toBeInTheDocument()
  })

  it('selects a time and locks after it is correct', async () => {
    const user = userEvent.setup()
    const onSelect = vi.fn()
    const { rerender } = render(<ClockQuestion question={question} selectedChoiceId={null} feedback="none" onSelect={onSelect} />)

    await user.click(screen.getByRole('button', { name: '3じ' }))
    expect(onSelect).toHaveBeenCalledWith('choice-3')

    rerender(<ClockQuestion question={question} selectedChoiceId="choice-3" feedback="correct" onSelect={onSelect} />)
    expect(screen.getByText('せいかい！')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '3じ' })).toBeDisabled()
  })
})
