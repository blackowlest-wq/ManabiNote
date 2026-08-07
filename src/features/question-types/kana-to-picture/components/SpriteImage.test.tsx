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
  it('renders an accessible raster crop for a known animal atlas symbol', () => {
    const { container } = render(<SpriteImage image={dogChoice.image} alt={dogChoice.label} />)

    const image = screen.getByRole('img', { name: 'いぬ' })

    expect(image.tagName.toLowerCase()).toBe('div')
    expect(image).toHaveClass('kana-picture-choice__image')
    expect(image).toHaveStyle({
      backgroundImage: 'url("/images/kana-to-picture/atlases/animals-01-v2.webp")',
      backgroundSize: '600% 600%',
      backgroundPosition: '60% 20%',
    })
    expect(container.querySelector('use')).toBeNull()
  })

  it('renders an accessible raster crop for a known food atlas symbol', () => {
    const foodChoice: PictureChoiceData = {
      ...dogChoice,
      label: 'りんご',
      reading: 'りんご',
      image: { atlasId: 'food-01', symbolId: 'apple' },
    }
    const { container } = render(<SpriteImage image={foodChoice.image} alt={foodChoice.label} />)

    const image = screen.getByRole('img', { name: 'りんご' })

    expect(image.tagName.toLowerCase()).toBe('div')
    expect(image).toHaveClass('kana-picture-choice__image')
    expect(image).toHaveStyle({
      backgroundImage: 'url("/images/kana-to-picture/atlases/food-01-v2.webp")',
      backgroundSize: '600% 500%',
      backgroundPosition: '0% 0%',
    })
    expect(container.querySelector('use')).toBeNull()
  })

  it('renders through PictureChoice without changing button accessibility', () => {
    render(
      <PictureChoice
        choice={dogChoice}
        selected={true}
        disabled={false}
        showLabel={false}
        onSelect={vi.fn()}
      />,
    )

    const button = screen.getByRole('button', { name: 'いぬ' })
    expect(screen.queryByText('いぬ')).not.toBeInTheDocument()
    const image = within(button).getByRole('img', { name: 'いぬ' })

    expect(button).toHaveAttribute('aria-pressed', 'true')
    expect(image).toHaveStyle({
      width: '160px',
      height: '160px',
      backgroundPosition: '60% 20%',
    })
  })

})
