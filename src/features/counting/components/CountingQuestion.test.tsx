import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import type { CountingQuestion as CountingQuestionData } from '../model/types'
import { CountingQuestion } from './CountingQuestion'

const question: CountingQuestionData = {
  id: 'counting-apple',
  label: 'りんご',
  image: { atlasId: 'food-01', symbolId: 'apple' },
  count: 3,
  choices: [
    { id: 'choice-1', count: 1 },
    { id: 'choice-2', count: 2 },
    { id: 'choice-3', count: 3 },
    { id: 'choice-4', count: 4 },
    { id: 'choice-5', count: 5 },
  ],
  correctChoiceId: 'choice-3',
}

describe('CountingQuestion', () => {
  it('shows repeated pictures and number choices', () => {
    render(<CountingQuestion question={question} selectedChoiceId={null} feedback="none" onSelect={vi.fn()} />)

    expect(screen.getByRole('group', { name: 'りんごが 3こ' })).toBeInTheDocument()
    expect(screen.getAllByRole('img', { name: 'りんご' })).toHaveLength(3)
    expect(screen.getByRole('group', { name: 'かずをえらぶ' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '3こ' })).toBeEnabled()
  })

  it('calls the choice handler and locks after a correct answer', async () => {
    const user = userEvent.setup()
    const onSelect = vi.fn()
    const { rerender } = render(<CountingQuestion question={question} selectedChoiceId={null} feedback="none" onSelect={onSelect} />)

    await user.click(screen.getByRole('button', { name: '3こ' }))
    expect(onSelect).toHaveBeenCalledWith('choice-3')

    rerender(<CountingQuestion question={question} selectedChoiceId="choice-3" feedback="correct" onSelect={onSelect} />)
    expect(screen.getByText('せいかい！')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '3こ' })).toBeDisabled()
  })

  it('keeps choices enabled after an incorrect answer', () => {
    render(<CountingQuestion question={question} selectedChoiceId="choice-2" feedback="incorrect" onSelect={vi.fn()} />)

    expect(screen.getByText('もういちど かぞえてね')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '3こ' })).toBeEnabled()
  })
})
