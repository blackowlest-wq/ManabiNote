import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import type { AudioKanaQuestion as AudioKanaQuestionData } from '../model/types'
import { AudioKanaQuestion } from './AudioKanaQuestion'

const question: AudioKanaQuestionData = {
  id: 'audio-kana-ね',
  answer: 'ね',
  choices: [
    { id: 'choice-ne', character: 'ね' },
    { id: 'choice-me', character: 'め' },
    { id: 'choice-re', character: 'れ' },
    { id: 'choice-nu', character: 'ぬ' },
  ],
  correctChoiceId: 'choice-ne',
}

describe('AudioKanaQuestion', () => {
  it('shows a play button and kana choices', () => {
    render(<AudioKanaQuestion question={question} selectedChoiceId={null} feedback="none" onPlay={vi.fn()} onSelect={vi.fn()} />)

    expect(screen.getByRole('button', { name: 'おとを きく' })).toBeEnabled()
    expect(screen.getByRole('group', { name: 'かなをえらぶ' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'ね' })).toBeEnabled()
  })

  it('calls the play handler and locks choices after a correct answer', async () => {
    const user = userEvent.setup()
    const onPlay = vi.fn()
    const onSelect = vi.fn()
    const { rerender } = render(<AudioKanaQuestion question={question} selectedChoiceId={null} feedback="none" onPlay={onPlay} onSelect={onSelect} />)

    await user.click(screen.getByRole('button', { name: 'おとを きく' }))
    expect(onPlay).toHaveBeenCalledOnce()
    await user.click(screen.getByRole('button', { name: 'ね' }))
    expect(onSelect).toHaveBeenCalledWith('choice-ne')

    rerender(<AudioKanaQuestion question={question} selectedChoiceId="choice-ne" feedback="correct" onPlay={onPlay} onSelect={onSelect} />)
    expect(screen.getByText('せいかい！')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'ね' })).toBeDisabled()
  })

  it('keeps choices enabled after an incorrect answer', () => {
    render(<AudioKanaQuestion question={question} selectedChoiceId="choice-me" feedback="incorrect" onPlay={vi.fn()} onSelect={vi.fn()} />)

    expect(screen.getByText('もういちど えらんでね')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'ね' })).toBeEnabled()
  })
})
