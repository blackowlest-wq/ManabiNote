import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { KanaQuestion } from './KanaQuestion'
import type { KanaToPictureQuestion } from '../model/types'

const question: KanaToPictureQuestion = {
  type: 'kana-to-picture',
  id: 'hiragana-a',
  kana: 'あ',
  choices: [
    { id: 'apple', label: 'りんご', imageSrc: '/images/kana-to-picture/apple.svg' },
    { id: 'ant', label: 'あり', imageSrc: '/images/kana-to-picture/ant.svg' },
    { id: 'umbrella', label: 'かさ', imageSrc: '/images/kana-to-picture/umbrella.svg' },
  ],
  correctChoiceId: 'apple',
}

describe('KanaQuestion', () => {
  it('renders the kana and three labelled image buttons', () => {
    render(
      <KanaQuestion
        question={question}
        selectedChoiceId={null}
        disabled={false}
        onSelect={vi.fn()}
      />,
    )

    expect(screen.getByRole('heading', { name: 'あ' })).toBeInTheDocument()
    expect(screen.getAllByRole('button')).toHaveLength(3)
    expect(screen.getByRole('button', { name: 'りんご' })).toBeInTheDocument()
    expect(screen.getByAltText('りんご')).toBeInTheDocument()
    expect(screen.getByAltText('あり')).toBeInTheDocument()
    expect(screen.getByAltText('かさ')).toBeInTheDocument()
  })

  it('reports the selected choice id and exposes its pressed state', async () => {
    const user = userEvent.setup()
    const onSelect = vi.fn()

    render(
      <KanaQuestion
        question={question}
        selectedChoiceId="apple"
        disabled={false}
        onSelect={onSelect}
      />,
    )

    expect(screen.getByRole('button', { name: 'りんご' })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByRole('button', { name: 'あり' })).toHaveAttribute('aria-pressed', 'false')

    await user.click(screen.getByRole('button', { name: 'あり' }))
    expect(onSelect).toHaveBeenCalledWith('ant')
  })

  it('disables all choices after answering', async () => {
    const user = userEvent.setup()
    const onSelect = vi.fn()

    render(
      <KanaQuestion
        question={question}
        selectedChoiceId="apple"
        disabled={true}
        onSelect={onSelect}
      />,
    )

    const buttons = screen.getAllByRole('button')
    expect(buttons).toHaveLength(3)
    buttons.forEach((button) => expect(button).toBeDisabled())

    await user.click(buttons[1])
    expect(onSelect).not.toHaveBeenCalled()
  })
})
