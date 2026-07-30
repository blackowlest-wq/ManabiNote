import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { PageLayout } from './PageLayout'

describe('PageLayout', () => {
  it('renders the page title as the semantic main heading', () => {
    render(
      <PageLayout title="ひらがなを れんしゅう">
        <p>ここから はじめよう</p>
      </PageLayout>,
    )

    expect(screen.getByRole('main')).toContainElement(
      screen.getByRole('heading', { level: 1, name: 'ひらがなを れんしゅう' }),
    )
    expect(screen.getByText('ここから はじめよう')).toBeInTheDocument()
  })
})
