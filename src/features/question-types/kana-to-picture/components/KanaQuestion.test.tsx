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
  it('renders the kana and three image buttons without visible labels before answering', () => {
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
    expect(screen.queryByText('りんご')).not.toBeInTheDocument()
    expect(screen.queryByText('あり')).not.toBeInTheDocument()
    expect(screen.queryByText('かさ')).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'りんご' })).toBeInTheDocument()
    expect(screen.getByRole('img', { name: 'りんご' })).toBeInTheDocument()
    expect(screen.getByRole('img', { name: 'あり' })).toBeInTheDocument()
    expect(screen.getByRole('img', { name: 'かさ' })).toBeInTheDocument()
  })

  it('reveals the picture labels after answering', () => {
    render(
      <KanaQuestion
        question={question}
        selectedChoiceId="ant"
        disabled={true}
        onSelect={vi.fn()}
      />,
    )

    expect(screen.getByText('りんご')).toBeInTheDocument()
    expect(screen.getByText('あり')).toBeInTheDocument()
    expect(screen.getByText('かさ')).toBeInTheDocument()
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

  it('renders atlas-backed raster crops instead of an undefined source', () => {
    const { container } = render(
      <KanaQuestion
        question={question}
        selectedChoiceId={null}
        disabled={false}
        onSelect={vi.fn()}
      />,
    )

    const appleImage = screen.getByRole('img', { name: 'りんご' })

    expect(appleImage.tagName.toLowerCase()).toBe('div')
    expect(appleImage).toHaveClass('kana-picture-choice__image')
    expect(appleImage).toHaveStyle({
      backgroundImage: 'url("/images/kana-to-picture/atlases/food-01-v2.webp")',
      backgroundSize: '600% 500%',
      backgroundPosition: '0% 0%',
    })
    expect(container.querySelector('use')).toBeNull()
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
