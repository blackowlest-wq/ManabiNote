import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import type { SentenceOrderQuestion as SentenceOrderQuestionData } from '../model/types'
import { SentenceOrderQuestion } from './SentenceOrderQuestion'

const question: SentenceOrderQuestionData = {
  id: 'sentence-order-ringo',
  sentence: 'わたしは りんごを たべます',
  words: ['わたしは', 'りんごを', 'たべます'],
  choices: [
    { id: 'choice-ringo', word: 'りんごを' },
    { id: 'choice-eat', word: 'たべます' },
    { id: 'choice-me', word: 'わたしは' },
  ],
  correctChoiceIds: ['choice-me', 'choice-ringo', 'choice-eat'],
}

describe('SentenceOrderQuestion', () => {
  it('shows word choices and the selected sentence', () => {
    render(
      <SentenceOrderQuestion
        question={question}
        selectedChoiceIds={['choice-me']}
        feedback="none"
        onSelect={vi.fn()}
        onUndo={vi.fn()}
        onSubmit={vi.fn()}
      />,
    )

    expect(screen.getByText('ことばを ならべて ぶんを つくろう')).toBeInTheDocument()
    expect(screen.getByRole('group', { name: 'ことばをえらぶ' })).toBeInTheDocument()
    expect(screen.getByRole('status', { name: 'できあがったぶん' })).toHaveTextContent('わたしは')
    expect(screen.getByRole('button', { name: 'こたえあわせ' })).toBeEnabled()
  })

  it('calls selection, undo, and submit handlers', async () => {
    const user = userEvent.setup()
    const onSelect = vi.fn()
    const onUndo = vi.fn()
    const onSubmit = vi.fn()
    render(
      <SentenceOrderQuestion
        question={question}
        selectedChoiceIds={['choice-me']}
        feedback="none"
        onSelect={onSelect}
        onUndo={onUndo}
        onSubmit={onSubmit}
      />,
    )

    await user.click(screen.getByRole('button', { name: 'りんごを' }))
    await user.click(screen.getByRole('button', { name: 'もどす' }))
    await user.click(screen.getByRole('button', { name: 'こたえあわせ' }))

    expect(onSelect).toHaveBeenCalledWith('choice-ringo')
    expect(onUndo).toHaveBeenCalledTimes(1)
    expect(onSubmit).toHaveBeenCalledTimes(1)
  })

  it('locks the controls after a correct answer', () => {
    render(
      <SentenceOrderQuestion
        question={question}
        selectedChoiceIds={question.correctChoiceIds}
        feedback="correct"
        onSelect={vi.fn()}
        onUndo={vi.fn()}
        onSubmit={vi.fn()}
      />,
    )

    expect(screen.getByText('せいかい！')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'こたえあわせ' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'もどす' })).toBeDisabled()
  })
})
