import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { MissingCharacterQuestion } from './MissingCharacterQuestion'
import type { MissingCharacterQuestion as MissingCharacterQuestionData } from '../model/types'

const question: MissingCharacterQuestionData = {
  id: 'word-りんご',
  reading: 'りんご',
  image: { atlasId: 'food-01', symbolId: 'apple' },
  missingIndex: 1,
  correctCharacter: 'ん',
  choices: [
    { id: 'choice-ri', character: 'り' },
    { id: 'choice-n', character: 'ん' },
    { id: 'choice-go', character: 'ご' },
    { id: 'choice-ne', character: 'ね' },
  ],
  correctChoiceId: 'choice-n',
}

describe('MissingCharacterQuestion', () => {
  it('shows the picture, masked word, and candidate characters', () => {
    render(
      <MissingCharacterQuestion
        question={question}
        selectedChoiceId={null}
        feedback="none"
        onSelect={vi.fn()}
      />,
    )

    expect(screen.getByRole('img', { name: 'りんご' })).toBeInTheDocument()
    expect(screen.getByRole('paragraph', { name: '問題のことば り＿ご' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'り' })).toBeEnabled()
    expect(screen.getByRole('button', { name: 'ん' })).toBeEnabled()
    expect(screen.getByRole('button', { name: 'ご' })).toBeEnabled()
    expect(screen.getByRole('button', { name: 'ね' })).toBeEnabled()
  })

  it('notifies the selected answer and locks choices after a correct answer', async () => {
    const user = userEvent.setup()
    const onSelect = vi.fn()
    const { rerender } = render(
      <MissingCharacterQuestion
        question={question}
        selectedChoiceId={null}
        feedback="none"
        onSelect={onSelect}
      />,
    )

    await user.click(screen.getByRole('button', { name: 'ん' }))
    expect(onSelect).toHaveBeenCalledWith('choice-n')

    rerender(
      <MissingCharacterQuestion
        question={question}
        selectedChoiceId="choice-n"
        feedback="correct"
        onSelect={onSelect}
      />,
    )

    expect(screen.getByText('せいかい！')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'ん' })).toBeDisabled()
  })

  it('keeps choices available after an incorrect answer', () => {
    render(
      <MissingCharacterQuestion
        question={question}
        selectedChoiceId="choice-ri"
        feedback="incorrect"
        onSelect={vi.fn()}
      />,
    )

    expect(screen.getByText('もういちど えらんでね')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'ん' })).toBeEnabled()
  })
})
