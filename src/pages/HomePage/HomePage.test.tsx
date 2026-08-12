import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { HomePage } from './HomePage'

const renderPage = () => render(
  <MemoryRouter>
    <HomePage />
  </MemoryRouter>,
)

describe('HomePage', () => {
  it('shows the growing game collection as category links', () => {
    renderPage()

    expect(screen.getByTestId('home-actions')).toHaveClass('home-actions')
    expect(screen.getByRole('link', { name: 'ことば' })).toHaveAttribute('href', '/words')
    expect(screen.getByRole('link', { name: 'かず' })).toHaveAttribute('href', '/numbers')
    expect(screen.getByRole('link', { name: 'かたち' })).toHaveAttribute('href', '/shapes')
    expect(screen.getByRole('link', { name: 'かんじ' })).toHaveAttribute('href', '/kanji')
    expect(screen.getByRole('link', { name: 'ぶん' })).toHaveAttribute('href', '/sentences')
    expect(screen.getByRole('link', { name: 'ものしり' })).toHaveAttribute('href', '/knowledge')
    expect(screen.getByRole('link', { name: 'あそび' })).toHaveAttribute('href', '/play')
  })

  it('keeps the clear progress link outside the category menu', () => {
    renderPage()

    expect(screen.getByRole('link', { name: 'クリア状況を見る' })).toHaveAttribute('href', '/history')
  })
})
