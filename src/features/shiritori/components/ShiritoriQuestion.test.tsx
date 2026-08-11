import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import type { ShiritoriQuestion as ShiritoriQuestionData } from '../model/types'
import { ShiritoriQuestion } from './ShiritoriQuestion'

const question: ShiritoriQuestionData = {
  id: 'shiritori-kuma',
  previousWord: 'くま',
  previousReading: 'くま',
  previousImage: { atlasId: 'animals-01', symbolId: 'bear' },
  choices: [
    { id: 'choice-makura', label: 'まくら', reading: 'まくら', image: { atlasId: 'objects-01', symbolId: 'pillow' } },
    { id: 'choice-ringo', label: 'りんご', reading: 'りんご', image: { atlasId: 'food-01', symbolId: 'apple' } },
    { id: 'choice-nek', label: 'ねこ', reading: 'ねこ', image: { atlasId: 'animals-01', symbolId: 'cat' } },
    { id: 'choice-sakana', label: 'さかな', reading: 'さかな', image: { atlasId: 'animals-01', symbolId: 'fish' } },
  ],
  correctChoiceId: 'choice-makura',
}

describe('ShiritoriQuestion', () => {
  it('shows the previous picture and next-word choices', () => {
    render(<ShiritoriQuestion question={question} selectedChoiceId={null} feedback="none" onSelect={vi.fn()} />)

    expect(screen.getByText('くま')).toBeInTheDocument()
    expect(screen.getByRole('group', { name: 'つぎのことばをえらぶ' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'まくら' })).toBeEnabled()
  })

  it('calls the choice handler and locks after a correct answer', async () => {
    const user = userEvent.setup()
    const onSelect = vi.fn()
    const { rerender } = render(<ShiritoriQuestion question={question} selectedChoiceId={null} feedback="none" onSelect={onSelect} />)

    await user.click(screen.getByRole('button', { name: 'まくら' }))
    expect(onSelect).toHaveBeenCalledWith('choice-makura')

    rerender(<ShiritoriQuestion question={question} selectedChoiceId="choice-makura" feedback="correct" onSelect={onSelect} />)
    expect(screen.getByText('せいかい！')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'まくら' })).toBeDisabled()
  })

  it('keeps choices enabled after an incorrect answer', () => {
    render(<ShiritoriQuestion question={question} selectedChoiceId="choice-ringo" feedback="incorrect" onSelect={vi.fn()} />)

    expect(screen.getByText('もういちど えらんでね')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'まくら' })).toBeEnabled()
  })
})
