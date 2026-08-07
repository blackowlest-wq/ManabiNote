import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import type { WordBuilderFeedback } from '../model/wordBuilderSession'
import type { WordBuilderQuestion as WordBuilderQuestionData, WordTile } from '../model/types'
import { WordBuilderQuestion } from './WordBuilderQuestion'

const question: WordBuilderQuestionData = {
  id: 'word-りんご',
  reading: 'りんご',
  image: { atlasId: 'food-01', symbolId: 'apple' },
}

const tiles: WordTile[] = [
  { id: 'tile-ri', character: 'り' },
  { id: 'tile-n', character: 'ん' },
  { id: 'tile-go', character: 'ご' },
]

const makeProps = (overrides: Partial<React.ComponentProps<typeof WordBuilderQuestion>> = {}) => ({
  question,
  tiles,
  selectedTileIds: [],
  feedback: 'none' as WordBuilderFeedback,
  onSelect: vi.fn(),
  onUndo: vi.fn(),
  onSubmit: vi.fn(),
  ...overrides,
})

describe('WordBuilderQuestion', () => {
  it('calls select when a tile is pressed and enables undo for a selected sequence', async () => {
    const user = userEvent.setup()
    const props = makeProps()
    const { rerender } = render(<WordBuilderQuestion {...props} />)

    await user.click(screen.getByRole('button', { name: 'り' }))
    expect(props.onSelect).toHaveBeenCalledWith('tile-ri')

    rerender(<WordBuilderQuestion {...props} selectedTileIds={['tile-ri']} />)
    expect(screen.getByRole('button', { name: 'もどす' })).toBeEnabled()
  })

  it('shows できた only when all characters are selected', () => {
    const props = makeProps()
    const { rerender } = render(<WordBuilderQuestion {...props} selectedTileIds={['tile-ri']} />)
    expect(screen.queryByRole('button', { name: 'できた！' })).not.toBeInTheDocument()

    rerender(<WordBuilderQuestion {...props} selectedTileIds={['tile-ri', 'tile-n', 'tile-go']} />)
    expect(screen.getByRole('button', { name: 'できた！' })).toBeEnabled()
  })

  it('shows retry feedback while leaving the selected sequence visible', () => {
    render(<WordBuilderQuestion {...makeProps({ selectedTileIds: ['tile-go'], feedback: 'incorrect' })} />)

    expect(screen.getByText('もういちど')).toBeInTheDocument()
    expect(screen.getByText('ご')).toBeInTheDocument()
  })
})
