import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import type { DakutenQuestion as DakutenQuestionData } from '../model/types'
import { DakutenQuestion } from './DakutenQuestion'

const question: DakutenQuestionData = {
  id: 'dakuten-か',
  baseCharacter: 'か',
  mark: '゛',
  answer: 'が',
  choices: [
    { id: 'choice-ga', character: 'が' },
    { id: 'choice-gi', character: 'ぎ' },
    { id: 'choice-ba', character: 'ば' },
    { id: 'choice-pa', character: 'ぱ' },
  ],
  correctChoiceId: 'choice-ga',
}

describe('DakutenQuestion', () => {
  it('shows the base character, mark, and answer choices', () => {
    render(<DakutenQuestion question={question} selectedChoiceId={null} feedback="none" onSelect={vi.fn()} />)

    expect(screen.getByLabelText('かに゛')).toBeInTheDocument()
    expect(screen.getByRole('group', { name: 'こたえをえらぶ' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'が' })).toBeEnabled()
  })

  it('notifies a choice and locks the choices after a correct answer', async () => {
    const user = userEvent.setup()
    const onSelect = vi.fn()
    const { rerender } = render(<DakutenQuestion question={question} selectedChoiceId={null} feedback="none" onSelect={onSelect} />)

    await user.click(screen.getByRole('button', { name: 'が' }))
    expect(onSelect).toHaveBeenCalledWith('choice-ga')

    rerender(<DakutenQuestion question={question} selectedChoiceId="choice-ga" feedback="correct" onSelect={onSelect} />)
    expect(screen.getByText('せいかい！')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'が' })).toBeDisabled()
  })

  it('keeps choices enabled after an incorrect answer', () => {
    render(<DakutenQuestion question={question} selectedChoiceId="choice-gi" feedback="incorrect" onSelect={vi.fn()} />)

    expect(screen.getByText('もういちど えらんでね')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'が' })).toBeEnabled()
  })
})
