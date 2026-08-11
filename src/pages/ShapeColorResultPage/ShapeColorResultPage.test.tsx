import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { ShapeColorSessionProvider } from '../../features/shape-color/ShapeColorSessionProvider'
import { createShapeColorQuestions } from '../../features/shape-color/model/shapeColorQuestion'
import { createShapeColorSession, nextShapeColorQuestion, selectShapeColorChoice } from '../../features/shape-color/model/shapeColorSession'
import { ShapeColorResultPage } from './ShapeColorResultPage'

const createCompleteSession = () => {
  let session = createShapeColorSession(createShapeColorQuestions(() => 0.999), () => new Date('2026-08-11T14:00:00.000Z'), () => 0.999)
  for (let index = 0; index < 5; index += 1) {
    const question = session.questions[session.currentIndex]
    if (!question) throw new Error('テスト問題が見つかりません')
    session = nextShapeColorQuestion(selectShapeColorChoice(session, question.correctChoiceId))
  }
  return session
}

describe('ShapeColorResultPage', () => {
  it('shows a recoverable message without a completed session', () => {
    render(<ShapeColorResultPage />, {
      wrapper: ({ children }) => (
        <MemoryRouter>
          <ShapeColorSessionProvider>{children}</ShapeColorSessionProvider>
        </MemoryRouter>
      ),
    })

    expect(screen.getByText('結果を表示できません。')).toBeInTheDocument()
  })

  it('shows the completion message and actions', () => {
    render(<ShapeColorResultPage />, {
      wrapper: ({ children }) => (
        <MemoryRouter>
          <ShapeColorSessionProvider initialSession={createCompleteSession()}>{children}</ShapeColorSessionProvider>
        </MemoryRouter>
      ),
    })

    expect(screen.getByText('5もん できたね！')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'もういちど' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'ホームへ戻る' })).toBeInTheDocument()
  })
})
