import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Link, Route, Routes } from 'react-router-dom'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { ScrollToTop } from './ScrollToTop'

describe('ScrollToTop', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('scrolls to the top after the page changes', async () => {
    const user = userEvent.setup()
    const scrollTo = vi.spyOn(window, 'scrollTo').mockImplementation(() => {})

    render(
      <MemoryRouter initialEntries={['/home']}>
        <ScrollToTop />
        <Routes>
          <Route path="/home" element={<Link to="/shiritori">しりとりへ</Link>} />
          <Route path="/shiritori" element={<p>しりとり</p>} />
        </Routes>
      </MemoryRouter>,
    )

    expect(scrollTo).toHaveBeenLastCalledWith(0, 0)

    await user.click(screen.getByRole('link', { name: 'しりとりへ' }))

    expect(screen.getByText('しりとり')).toBeInTheDocument()
    expect(scrollTo).toHaveBeenLastCalledWith(0, 0)
    expect(scrollTo).toHaveBeenCalledTimes(2)
  })
})
