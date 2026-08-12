import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import type { KanjiReadingQuestion as KanjiReadingQuestionData } from '../model/types'
import { KanjiReadingQuestion } from './KanjiReadingQuestion'

const question: KanjiReadingQuestionData = {
  id: 'kanji-yama',
  kanji: '山',
  word: '山',
  answer: 'やま',
  choices: [
    { id: 'choice-yama', reading: 'やま' },
    { id: 'choice-kawa', reading: 'かわ' },
    { id: 'choice-sora', reading: 'そら' },
    { id: 'choice-hana', reading: 'はな' },
  ],
  correctChoiceId: 'choice-yama',
}

const contextualQuestion: KanjiReadingQuestionData = {
  id: 'kanji-school',
  kanji: '校',
  word: '学校',
  answer: 'がっこう',
  choices: [
    { id: 'choice-school', reading: 'がっこう' },
    { id: 'choice-teacher', reading: 'せんせい' },
    { id: 'choice-letter', reading: 'もじ' },
    { id: 'choice-book', reading: 'ほん' },
  ],
  correctChoiceId: 'choice-school',
}

describe('KanjiReadingQuestion', () => {
  it('shows the kanji and reading choices', () => {
    render(<KanjiReadingQuestion question={question} selectedChoiceId={null} feedback="none" onSelect={vi.fn()} />)

    expect(screen.getByText('この ことばの よみかたは どれ？')).toBeInTheDocument()
    expect(screen.getByRole('group', { name: 'よみかたをえらぶ' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'やま' })).toBeEnabled()
  })

  it('shows the word context and identifies the kanji being learned', () => {
    render(<KanjiReadingQuestion question={contextualQuestion} selectedChoiceId={null} feedback="none" onSelect={vi.fn()} />)

    expect(screen.getByLabelText('ことば 学校、よむ かんじ 校')).toHaveTextContent('学校')
    expect(screen.getByLabelText('よむ かんじ 校')).toHaveTextContent('校')
  })

  it('calls the choice handler and locks after a correct answer', async () => {
    const user = userEvent.setup()
    const onSelect = vi.fn()
    const { rerender } = render(<KanjiReadingQuestion question={question} selectedChoiceId={null} feedback="none" onSelect={onSelect} />)

    await user.click(screen.getByRole('button', { name: 'やま' }))
    expect(onSelect).toHaveBeenCalledWith('choice-yama')

    rerender(<KanjiReadingQuestion question={question} selectedChoiceId="choice-yama" feedback="correct" onSelect={onSelect} />)
    expect(screen.getByText('せいかい！')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'やま' })).toBeDisabled()
  })
})
