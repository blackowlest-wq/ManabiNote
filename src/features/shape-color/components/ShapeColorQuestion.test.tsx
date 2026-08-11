import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import type { ShapeColorQuestion as ShapeColorQuestionData } from '../model/types'
import { ShapeColorQuestion } from './ShapeColorQuestion'

const question: ShapeColorQuestionData = {
  id: 'shape-color-red-circle',
  targetShape: 'circle',
  targetColor: 'red',
  choices: [
    { id: 'choice-correct', shape: 'circle', color: 'red' },
    { id: 'choice-shape', shape: 'triangle', color: 'red' },
    { id: 'choice-color', shape: 'circle', color: 'blue' },
    { id: 'choice-other', shape: 'square', color: 'yellow' },
  ],
  correctChoiceId: 'choice-correct',
}

describe('ShapeColorQuestion', () => {
  it('shows a target shape and four choices', () => {
    render(<ShapeColorQuestion question={question} selectedChoiceId={null} feedback="none" onSelect={vi.fn()} />)

    expect(screen.getByRole('img', { name: 'あかのまる' })).toBeInTheDocument()
    expect(screen.getByRole('group', { name: 'おなじいろとかたちをえらぶ' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'あかのまる' })).toBeEnabled()
  })

  it('calls the choice handler and locks after a correct answer', async () => {
    const user = userEvent.setup()
    const onSelect = vi.fn()
    const { rerender } = render(<ShapeColorQuestion question={question} selectedChoiceId={null} feedback="none" onSelect={onSelect} />)

    await user.click(screen.getByRole('button', { name: 'あかのまる' }))
    expect(onSelect).toHaveBeenCalledWith('choice-correct')

    rerender(<ShapeColorQuestion question={question} selectedChoiceId="choice-correct" feedback="correct" onSelect={onSelect} />)
    expect(screen.getByText('せいかい！')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'あかのまる' })).toBeDisabled()
  })

  it('keeps choices enabled after an incorrect answer', () => {
    render(<ShapeColorQuestion question={question} selectedChoiceId="choice-shape" feedback="incorrect" onSelect={vi.fn()} />)

    expect(screen.getByText('もういちど えらんでね')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'あかのまる' })).toBeEnabled()
  })
})
