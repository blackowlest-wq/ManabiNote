import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { CategoryPage } from './CategoryPage'

describe('CategoryPage', () => {
  it('shows a category description and links to its games', () => {
    render(
      <MemoryRouter>
        <CategoryPage
          title="ことば"
          description="ことばで あそぼう"
          games={[
            { to: '/word-builder', label: 'ことばをつくろう', description: 'えの なまえを つくる' },
            { to: '/shiritori', label: 'しりとり', description: 'つぎの ことばを えらぶ' },
          ]}
        />
      </MemoryRouter>,
    )

    expect(screen.getByRole('heading', { level: 1, name: 'ことば' })).toBeInTheDocument()
    expect(screen.getByText('ことばで あそぼう')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /ことばをつくろう/ })).toHaveAttribute('href', '/word-builder')
    expect(screen.getByRole('link', { name: /しりとり/ })).toHaveAttribute('href', '/shiritori')
    expect(screen.getByRole('link', { name: 'ホームへ戻る' })).toHaveAttribute('href', '/')
  })
})
