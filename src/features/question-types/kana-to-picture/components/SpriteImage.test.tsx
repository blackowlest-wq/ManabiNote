import { render, screen, within } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { PictureChoice } from './PictureChoice'
import { SpriteImage } from './SpriteImage'
import type { PictureChoice as PictureChoiceData } from '../model/types'

const dogChoice: PictureChoiceData = {
  id: 'dog',
  label: 'いぬ',
  reading: 'いぬ',
  image: {
    atlasId: 'animals-01',
    symbolId: 'dog',
  },
}

describe('SpriteImage', () => {
  it('renders an accessible external sprite use reference for a known atlas symbol', () => {
    const { container } = render(<SpriteImage image={dogChoice.image} alt={dogChoice.label} />)

    const image = screen.getByRole('img', { name: 'いぬ' })
    const useElement = container.querySelector('use')

    expect(image.tagName.toLowerCase()).toBe('svg')
    expect(useElement).not.toBeNull()
    expect(useElement).toHaveAttribute(
      'href',
      '/images/kana-to-picture/atlases/animals-01.svg#dog',
    )
  })

  it('renders through PictureChoice without changing button accessibility', () => {
    render(
      <PictureChoice
        choice={dogChoice}
        selected={true}
        disabled={false}
        onSelect={vi.fn()}
      />,
    )

    const button = screen.getByRole('button', { name: 'いぬ' })
    const image = within(button).getByRole('img', { name: 'いぬ' })
    const useElement = image.querySelector('use')

    expect(button).toHaveAttribute('aria-pressed', 'true')
    expect(image).toHaveAttribute('width', '160')
    expect(image).toHaveAttribute('height', '160')
    expect(useElement).toHaveAttribute(
      'href',
      '/images/kana-to-picture/atlases/animals-01.svg#dog',
    )
  })

})
