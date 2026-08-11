import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import type { ShapePatternQuestion as ShapePatternQuestionData } from '../model/types'
import { ShapePatternQuestion } from './ShapePatternQuestion'

const question: ShapePatternQuestionData = {
  id: 'shape-pattern-test',
  sequence: [
    { shape: 'circle', color: 'red' },
    { shape: 'circle', color: 'blue' },
    { shape: 'circle', color: 'red' },
    { shape: 'circle', color: 'blue' },
  ],
  answer: { shape: 'circle', color: 'red' },
  choices: [
    { id: 'choice-red-circle', shape: 'circle', color: 'red' },
    { id: 'choice-blue-circle', shape: 'circle', color: 'blue' },
    { id: 'choice-yellow-triangle', shape: 'triangle', color: 'yellow' },
    { id: 'choice-green-square', shape: 'square', color: 'green' },
  ],
  correctChoiceId: 'choice-red-circle',
}

describe('ShapePatternQuestion', () => {
  it('shows a visual sequence and text-only choices', () => {
    render(<ShapePatternQuestion question={question} selectedChoiceId={null} feedback="none" onSelect={vi.fn()} />)

    expect(screen.getByRole('group', { name: 'かたちの ならび' })).toBeInTheDocument()
    expect(screen.getByLabelText('つぎの かたち')).toHaveTextContent('？')
    expect(screen.getByRole('button', { name: 'あかい まる' })).toHaveTextContent('あかい まる')
  })

  it('selects the next shape and locks after it is correct', async () => {
    const user = userEvent.setup()
    const onSelect = vi.fn()
    const { rerender } = render(<ShapePatternQuestion question={question} selectedChoiceId={null} feedback="none" onSelect={onSelect} />)

    await user.click(screen.getByRole('button', { name: 'あかい まる' }))
    expect(onSelect).toHaveBeenCalledWith('choice-red-circle')

    rerender(<ShapePatternQuestion question={question} selectedChoiceId="choice-red-circle" feedback="correct" onSelect={onSelect} />)
    expect(screen.getByText('せいかい！')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'あかい まる' })).toBeDisabled()
  })
})
