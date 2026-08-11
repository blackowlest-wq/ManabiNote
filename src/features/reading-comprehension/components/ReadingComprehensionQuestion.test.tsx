import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import type { ReadingComprehensionQuestion as ReadingComprehensionQuestionData } from '../model/types'
import { ReadingComprehensionQuestion } from './ReadingComprehensionQuestion'

const question: ReadingComprehensionQuestionData = {
  id: 'reading-apple',
  passage: 'りんごは あかいです。',
  prompt: 'りんごは なんいろ？',
  choices: [
    { id: 'choice-red', text: 'あか' },
    { id: 'choice-blue', text: 'あお' },
    { id: 'choice-yellow', text: 'きいろ' },
    { id: 'choice-white', text: 'しろ' },
  ],
  correctChoiceId: 'choice-red',
}

describe('ReadingComprehensionQuestion', () => {
  it('shows the passage, prompt, and answer choices', () => {
    render(<ReadingComprehensionQuestion question={question} selectedChoiceId={null} feedback="none" onSelect={vi.fn()} />)

    expect(screen.getByText(question.passage)).toBeInTheDocument()
    expect(screen.getByText(question.prompt)).toBeInTheDocument()
    expect(screen.getByRole('group', { name: 'こたえをえらぶ' })).toBeInTheDocument()
  })

  it('selects an answer and locks choices after it is correct', async () => {
    const user = userEvent.setup()
    const onSelect = vi.fn()
    const { rerender } = render(<ReadingComprehensionQuestion question={question} selectedChoiceId={null} feedback="none" onSelect={onSelect} />)

    await user.click(screen.getByRole('button', { name: 'あか' }))
    expect(onSelect).toHaveBeenCalledWith('choice-red')

    rerender(<ReadingComprehensionQuestion question={question} selectedChoiceId="choice-red" feedback="correct" onSelect={onSelect} />)
    expect(screen.getByText('せいかい！')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'あか' })).toBeDisabled()
  })
})
