import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { KanaQuestion } from './KanaQuestion'
import type { KanaToPictureQuestion } from '../model/types'

const question: KanaToPictureQuestion = {
  type: 'kana-to-picture',
  id: 'hiragana-a',
  kana: 'あ',
  reading: 'あり',
  choices: [
    { id: 'apple', label: 'りんご', reading: 'りんご', image: { atlasId: 'food-01', symbolId: 'apple' } },
    { id: 'ant', label: 'あり', reading: 'あり', image: { atlasId: 'animals-01', symbolId: 'ant' } },
    { id: 'umbrella', label: 'かさ', reading: 'かさ', image: { atlasId: 'objects-01', symbolId: 'umbrella' } },
  ],
  correctChoiceId: 'ant',
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
    expect(screen.getByText('「あ」から はじまる ことばを えらぼう')).toBeInTheDocument()
    expect(screen.getAllByRole('button')).toHaveLength(3)
    expect(screen.getByRole('button', { name: 'りんご' })).toBeInTheDocument()
    expect(screen.getByRole('img', { name: 'りんご' })).toBeInTheDocument()
    expect(screen.getByRole('img', { name: 'あり' })).toBeInTheDocument()
    expect(screen.getByRole('img', { name: 'かさ' })).toBeInTheDocument()
  })

  it('uses the current kana in the instruction text', () => {
    render(
      <KanaQuestion
        question={{ ...question, id: 'hiragana-u', kana: 'う' }}
        selectedChoiceId={null}
        disabled={false}
        onSelect={vi.fn()}
      />,
    )

    expect(screen.getByText('「う」から はじまる ことばを えらぼう')).toBeInTheDocument()
  })

  it('renders atlas-backed external use references instead of an undefined source', () => {
    const { container } = render(
      <KanaQuestion
        question={question}
        selectedChoiceId={null}
        disabled={false}
        onSelect={vi.fn()}
      />,
    )

    const appleImage = screen.getByRole('img', { name: 'りんご' })
    const useElement = container.querySelector('use')

    expect(appleImage.tagName.toLowerCase()).toBe('svg')
    expect(useElement).toHaveAttribute('href', '/images/kana-to-picture/atlases/food-01.svg#apple')
  })

  it('reports the selected choice id and exposes its pressed state', async () => {
    const user = userEvent.setup()
    const onSelect = vi.fn()

    render(
      <KanaQuestion
        question={question}
        selectedChoiceId="ant"
        disabled={false}
        onSelect={onSelect}
      />,
    )

    expect(screen.getByRole('button', { name: 'りんご' })).toHaveAttribute('aria-pressed', 'false')
    expect(screen.getByRole('button', { name: 'あり' })).toHaveAttribute('aria-pressed', 'true')

    await user.click(screen.getByRole('button', { name: 'あり' }))
    expect(onSelect).toHaveBeenCalledWith('ant')
  })

  it('disables all choices after answering', async () => {
    const user = userEvent.setup()
    const onSelect = vi.fn()

    render(
      <KanaQuestion
        question={question}
        selectedChoiceId="ant"
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
