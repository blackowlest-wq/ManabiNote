import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it } from 'vitest'
import { HistoryPage } from './HistoryPage'

describe('HistoryPage', () => {
  beforeEach(() => localStorage.clear())

  it('shows a plain empty state when there is no history', () => {
    render(
      <MemoryRouter>
        <HistoryPage />
      </MemoryRouter>,
    )

    expect(screen.getByText('まだ学習履歴がありません')).toBeInTheDocument()
  })
})
