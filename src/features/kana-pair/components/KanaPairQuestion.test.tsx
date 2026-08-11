import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import type { KanaPairQuestion as KanaPairQuestionData } from '../model/types'
import { KanaPairQuestion } from './KanaPairQuestion'

const question: KanaPairQuestionData = {
  id: 'kana-pair-ね',
  hiragana: 'ね',
  katakana: 'ネ',
  choices: [
    { id: 'choice-ne', character: 'ネ' },
    { id: 'choice-me', character: 'メ' },
    { id: 'choice-re', character: 'レ' },
    { id: 'choice-nu', character: 'ヌ' },
  ],
  correctChoiceId: 'choice-ne',
}

describe('KanaPairQuestion', () => {
  it('shows the hiragana and four katakana choices', () => {
    render(
      <KanaPairQuestion
        question={question}
        selectedChoiceId={null}
        feedback="none"
        onSelect={vi.fn()}
      />,
    )

    expect(screen.getByRole('heading', { name: 'ね' })).toBeInTheDocument()
    expect(screen.getByRole('group', { name: 'カタカナをえらぶ' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'ネ' })).toBeEnabled()
    expect(screen.getAllByRole('button')).toHaveLength(4)
  })

  it('notifies a choice and disables all choices after a correct answer', async () => {
    const user = userEvent.setup()
    const onSelect = vi.fn()
    const { rerender } = render(
      <KanaPairQuestion
        question={question}
        selectedChoiceId={null}
        feedback="none"
        onSelect={onSelect}
      />,
    )

    await user.click(screen.getByRole('button', { name: 'ネ' }))
    expect(onSelect).toHaveBeenCalledWith('choice-ne')

    rerender(
      <KanaPairQuestion
        question={question}
        selectedChoiceId="choice-ne"
        feedback="correct"
        onSelect={onSelect}
      />,
    )

    expect(screen.getByText('せいかい！')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'ネ' })).toBeDisabled()
  })

  it('keeps choices enabled after an incorrect answer', () => {
    render(
      <KanaPairQuestion
        question={question}
        selectedChoiceId="choice-me"
        feedback="incorrect"
        onSelect={vi.fn()}
      />,
    )

    expect(screen.getByText('もういちど えらんでね')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'ネ' })).toBeEnabled()
  })
})
