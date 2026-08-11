import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import type { MemoryCard } from '../model/types'
import { MemoryBoard } from './MemoryBoard'

const cards: MemoryCard[] = [
  { id: 'pair-a-kana', pairId: 'pair-a', kind: 'kana', character: 'あ' },
  { id: 'pair-a-picture', pairId: 'pair-a', kind: 'picture', label: 'あり', image: { atlasId: 'animals-01', symbolId: 'ant' } },
]

describe('MemoryBoard', () => {
  it('shows face-down cards and flips the selected card', async () => {
    const user = userEvent.setup()
    const onFlip = vi.fn()

    render(<MemoryBoard cards={cards} flippedCardIds={[]} matchedPairIds={[]} onFlip={onFlip} />)

    await user.click(screen.getByRole('button', { name: 'うらむきカード 1' }))

    expect(onFlip).toHaveBeenCalledWith('pair-a-kana')
  })

  it('shows a kana and picture when their cards are flipped', () => {
    render(<MemoryBoard cards={cards} flippedCardIds={['pair-a-kana', 'pair-a-picture']} matchedPairIds={[]} onFlip={vi.fn()} />)

    expect(screen.getByRole('button', { name: 'かな あ のカード' })).toBeEnabled()
    expect(screen.getByRole('button', { name: 'え あり のカード' })).toBeEnabled()
    expect(screen.getByRole('img', { name: 'ありのえ' })).toBeInTheDocument()
  })

  it('keeps a matched pair visible and disables its cards', () => {
    render(<MemoryBoard cards={cards} flippedCardIds={[]} matchedPairIds={['pair-a']} onFlip={vi.fn()} />)

    expect(screen.getByRole('button', { name: 'かな あ のカード' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'え あり のカード' })).toBeDisabled()
  })
})
