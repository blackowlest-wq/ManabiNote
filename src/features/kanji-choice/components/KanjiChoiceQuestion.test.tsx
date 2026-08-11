import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import type { KanjiChoiceQuestion as KanjiChoiceQuestionData } from '../model/types'
import { KanjiChoiceQuestion } from './KanjiChoiceQuestion'

const question: KanjiChoiceQuestionData = {
  id: 'kanji-choice-yama',
  reading: 'やま',
  answer: '山',
  choices: [
    { id: 'choice-yama', kanji: '山' },
    { id: 'choice-kawa', kanji: '川' },
    { id: 'choice-sora', kanji: '空' },
    { id: 'choice-hana', kanji: '花' },
  ],
  correctChoiceId: 'choice-yama',
}

describe('KanjiChoiceQuestion', () => {
  it('shows the reading and kanji choices', () => {
    render(<KanjiChoiceQuestion question={question} selectedChoiceId={null} feedback="none" onSelect={vi.fn()} />)

    expect(screen.getByLabelText('よみかた やま')).toBeInTheDocument()
    expect(screen.getByRole('group', { name: 'かんじをえらぶ' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '山' })).toBeEnabled()
  })

  it('selects a kanji and locks after it is correct', async () => {
    const user = userEvent.setup()
    const onSelect = vi.fn()
    const { rerender } = render(<KanjiChoiceQuestion question={question} selectedChoiceId={null} feedback="none" onSelect={onSelect} />)

    await user.click(screen.getByRole('button', { name: '山' }))
    expect(onSelect).toHaveBeenCalledWith('choice-yama')

    rerender(<KanjiChoiceQuestion question={question} selectedChoiceId="choice-yama" feedback="correct" onSelect={onSelect} />)
    expect(screen.getByText('せいかい！')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '山' })).toBeDisabled()
  })
})
