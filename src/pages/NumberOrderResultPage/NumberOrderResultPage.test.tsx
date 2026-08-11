import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { NumberOrderSessionProvider } from '../../features/number-order/NumberOrderSessionProvider'
import { createNumberOrderQuestions } from '../../features/number-order/model/numberOrderQuestion'
import { createNumberOrderSession } from '../../features/number-order/model/numberOrderSession'
import { NumberOrderResultPage } from './NumberOrderResultPage'

const questions = createNumberOrderQuestions(() => 0.999)
const session = createNumberOrderSession(questions, () => new Date('2026-08-11T10:00:00.000Z'), () => 0.999)
const completedSession = { ...session, currentIndex: session.questions.length }

const renderPage = () => render(
  <MemoryRouter initialEntries={['/number-order/result']}>
    <NumberOrderSessionProvider initialSession={completedSession}>
      <Routes>
        <Route path="/number-order/result" element={<NumberOrderResultPage />} />
        <Route path="/number-order" element={<p>ゲームページ</p>} />
      </Routes>
    </NumberOrderSessionProvider>
  </MemoryRouter>,
)

describe('NumberOrderResultPage', () => {
  it('shows the completion message and menu link', () => {
    renderPage()

    expect(screen.getByRole('heading', { name: 'かずの れんしゅう おわり！' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'かずの メニューへ' })).toHaveAttribute('href', '/numbers')
  })

  it('starts another game from retry', async () => {
    const user = userEvent.setup()
    renderPage()

    await user.click(screen.getByRole('button', { name: 'もういちど' }))

    expect(screen.getByText('ゲームページ')).toBeInTheDocument()
  })
})
