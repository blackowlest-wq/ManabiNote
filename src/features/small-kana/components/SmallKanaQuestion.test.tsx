import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import type { SmallKanaQuestion as SmallKanaQuestionData } from '../model/types'
import { SmallKanaQuestion } from './SmallKanaQuestion'

const question: SmallKanaQuestionData = {
  id: 'small-kana-kyaku',
  word: 'きゃく',
  answer: 'ゃ',
  choices: [
    { id: 'choice-small-ya', character: 'ゃ' },
    { id: 'choice-large-ya', character: 'や' },
    { id: 'choice-small-yu', character: 'ゅ' },
    { id: 'choice-small-yo', character: 'ょ' },
  ],
  correctChoiceId: 'choice-small-ya',
}

describe('SmallKanaQuestion', () => {
  it('shows the masked word and small kana choices', () => {
    render(<SmallKanaQuestion question={question} selectedChoiceId={null} feedback="none" onSelect={vi.fn()} />)

    expect(screen.getByLabelText('問題のことば き＿く')).toBeInTheDocument()
    expect(screen.getByRole('group', { name: 'ちいさいかなをえらぶ' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'ゃ' })).toBeEnabled()
  })

  it('calls the choice handler and locks after a correct answer', async () => {
    const user = userEvent.setup()
    const onSelect = vi.fn()
    const { rerender } = render(<SmallKanaQuestion question={question} selectedChoiceId={null} feedback="none" onSelect={onSelect} />)

    await user.click(screen.getByRole('button', { name: 'ゃ' }))
    expect(onSelect).toHaveBeenCalledWith('choice-small-ya')

    rerender(<SmallKanaQuestion question={question} selectedChoiceId="choice-small-ya" feedback="correct" onSelect={onSelect} />)
    expect(screen.getByText('せいかい！')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'ゃ' })).toBeDisabled()
  })

  it('keeps choices enabled after an incorrect answer', () => {
    render(<SmallKanaQuestion question={question} selectedChoiceId="choice-large-ya" feedback="incorrect" onSelect={vi.fn()} />)

    expect(screen.getByText('もういちど えらんでね')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'ゃ' })).toBeEnabled()
  })
})
