import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { createShapePatternQuestions, getShapePatternLabel } from '../../features/shape-pattern/model/shapePatternQuestion'
import { createShapePatternSession } from '../../features/shape-pattern/model/shapePatternSession'
import { ShapePatternSessionProvider } from '../../features/shape-pattern/ShapePatternSessionProvider'
import { ShapePatternPage } from './ShapePatternPage'

const initialSession = createShapePatternSession(
  createShapePatternQuestions(() => 0.999),
  () => new Date('2026-08-11T10:00:00.000Z'),
  () => 0.999,
)

const renderPage = () => render(
  <MemoryRouter initialEntries={['/shape-pattern']}>
    <ShapePatternSessionProvider initialSession={initialSession}>
      <Routes>
        <Route path="/shape-pattern" element={<ShapePatternPage />} />
        <Route path="/shape-pattern/result" element={<p>けっかページ</p>} />
      </Routes>
    </ShapePatternSessionProvider>
  </MemoryRouter>,
)

describe('ShapePatternPage', () => {
  it('shows progress and a shape sequence', () => {
    renderPage()

    expect(screen.getByText('1 / 5')).toBeInTheDocument()
    expect(screen.getByRole('group', { name: 'かたちの ならび' })).toBeInTheDocument()
  })

  it('advances after the next shape is selected', async () => {
    const user = userEvent.setup()
    const question = initialSession.questions[0]
    if (!question) throw new Error('問題がありません')
    const correctChoice = question.choices.find((choice) => choice.id === question.correctChoiceId)
    if (!correctChoice) throw new Error('正解がありません')
    renderPage()

    await user.click(screen.getByRole('button', { name: getShapePatternLabel(correctChoice) }))
    await user.click(screen.getByRole('button', { name: 'つぎへ' }))

    expect(screen.getByText('2 / 5')).toBeInTheDocument()
  })
})
