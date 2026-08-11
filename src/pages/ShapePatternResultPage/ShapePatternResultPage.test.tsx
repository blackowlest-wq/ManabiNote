import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { createShapePatternQuestions } from '../../features/shape-pattern/model/shapePatternQuestion'
import { createShapePatternSession } from '../../features/shape-pattern/model/shapePatternSession'
import { ShapePatternSessionProvider } from '../../features/shape-pattern/ShapePatternSessionProvider'
import { ShapePatternResultPage } from './ShapePatternResultPage'

const session = createShapePatternSession(
  createShapePatternQuestions(() => 0.999),
  () => new Date('2026-08-11T10:00:00.000Z'),
  () => 0.999,
)
const completedSession = { ...session, currentIndex: session.questions.length }

const renderPage = () => render(
  <MemoryRouter initialEntries={['/shape-pattern/result']}>
    <ShapePatternSessionProvider initialSession={completedSession}>
      <Routes>
        <Route path="/shape-pattern/result" element={<ShapePatternResultPage />} />
        <Route path="/shape-pattern" element={<p>ゲームページ</p>} />
      </Routes>
    </ShapePatternSessionProvider>
  </MemoryRouter>,
)

describe('ShapePatternResultPage', () => {
  it('shows the completion message and menu link', () => {
    renderPage()

    expect(screen.getByRole('heading', { name: 'かたちの ならび おわり！' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'かたちの メニューへ' })).toHaveAttribute('href', '/shapes')
  })

  it('starts another game from retry', async () => {
    const user = userEvent.setup()
    renderPage()

    await user.click(screen.getByRole('button', { name: 'もういちど' }))

    expect(screen.getByText('ゲームページ')).toBeInTheDocument()
  })
})
