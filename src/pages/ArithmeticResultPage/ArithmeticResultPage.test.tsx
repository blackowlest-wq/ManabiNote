import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { ArithmeticSessionProvider } from '../../features/arithmetic/ArithmeticSessionProvider'
import { createArithmeticQuestions } from '../../features/arithmetic/model/arithmeticQuestion'
import { createArithmeticSession } from '../../features/arithmetic/model/arithmeticSession'
import { ArithmeticResultPage } from './ArithmeticResultPage'

const session = createArithmeticSession(
  'addition',
  createArithmeticQuestions('addition', () => 0.999),
  () => new Date('2026-08-11T10:00:00.000Z'),
  () => 0.999,
)
const completedSession = { ...session, currentIndex: session.questions.length }

const renderPage = () => render(
  <MemoryRouter initialEntries={['/addition/result']}>
    <ArithmeticSessionProvider initialSession={completedSession}>
      <Routes>
        <Route path="/addition/result" element={<ArithmeticResultPage kind="addition" />} />
        <Route path="/addition" element={<p>ゲームページ</p>} />
      </Routes>
    </ArithmeticSessionProvider>
  </MemoryRouter>,
)

describe('ArithmeticResultPage', () => {
  it('shows the completion message and menu link', () => {
    renderPage()

    expect(screen.getByRole('heading', { name: 'たしざん おわり！' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'かずの メニューへ' })).toHaveAttribute('href', '/numbers')
  })

  it('starts another game from retry', async () => {
    const user = userEvent.setup()
    renderPage()

    await user.click(screen.getByRole('button', { name: 'もういちど' }))

    expect(screen.getByText('ゲームページ')).toBeInTheDocument()
  })
})
