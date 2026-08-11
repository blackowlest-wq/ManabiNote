import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import type { ParticleChoiceQuestion as ParticleChoiceQuestionData } from '../model/types'
import { ParticleChoiceQuestion } from './ParticleChoiceQuestion'

const question: ParticleChoiceQuestionData = {
  id: 'particle-pan',
  before: 'パン',
  after: 'たべます',
  answer: 'を',
  choices: [
    { id: 'choice-wo', particle: 'を' },
    { id: 'choice-ni', particle: 'に' },
    { id: 'choice-de', particle: 'で' },
    { id: 'choice-to', particle: 'と' },
  ],
  correctChoiceId: 'choice-wo',
}

describe('ParticleChoiceQuestion', () => {
  it('shows the sentence blank and particle choices', () => {
    render(<ParticleChoiceQuestion question={question} selectedChoiceId={null} feedback="none" onSelect={vi.fn()} />)

    expect(screen.getByLabelText('問題のぶん パン ＿ たべます')).toBeInTheDocument()
    expect(screen.getByRole('group', { name: 'つなぐことばをえらぶ' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'を' })).toBeEnabled()
  })

  it('selects a particle and locks after it is correct', async () => {
    const user = userEvent.setup()
    const onSelect = vi.fn()
    const { rerender } = render(<ParticleChoiceQuestion question={question} selectedChoiceId={null} feedback="none" onSelect={onSelect} />)

    await user.click(screen.getByRole('button', { name: 'を' }))
    expect(onSelect).toHaveBeenCalledWith('choice-wo')

    rerender(<ParticleChoiceQuestion question={question} selectedChoiceId="choice-wo" feedback="correct" onSelect={onSelect} />)
    expect(screen.getByText('せいかい！')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'を' })).toBeDisabled()
  })
})
