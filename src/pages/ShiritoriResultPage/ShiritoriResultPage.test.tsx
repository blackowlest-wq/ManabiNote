import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { loadKanaToPictureQuestions } from '../../features/question-types/kana-to-picture/model/loader'
import { ShiritoriSessionProvider } from '../../features/shiritori/ShiritoriSessionProvider'
import { createShiritoriQuestions } from '../../features/shiritori/model/shiritoriQuestion'
import { createShiritoriSession, nextShiritoriQuestion, selectShiritoriChoice } from '../../features/shiritori/model/shiritoriSession'
import { ShiritoriResultPage } from './ShiritoriResultPage'

const createCompleteSession = () => {
  let session = createShiritoriSession(createShiritoriQuestions(loadKanaToPictureQuestions(), () => 0.999), () => new Date('2026-08-11T14:00:00.000Z'), () => 0.999)
  for (let index = 0; index < 5; index += 1) {
    const question = session.questions[session.currentIndex]
    if (!question) throw new Error('テスト問題が見つかりません')
    session = nextShiritoriQuestion(selectShiritoriChoice(session, question.correctChoiceId))
  }
  return session
}

describe('ShiritoriResultPage', () => {
  it('shows a recoverable message without a completed session', () => {
    render(<ShiritoriResultPage />, {
      wrapper: ({ children }) => (
        <MemoryRouter>
          <ShiritoriSessionProvider>{children}</ShiritoriSessionProvider>
        </MemoryRouter>
      ),
    })

    expect(screen.getByText('結果を表示できません。')).toBeInTheDocument()
  })

  it('shows the completion message and actions', () => {
    render(<ShiritoriResultPage />, {
      wrapper: ({ children }) => (
        <MemoryRouter>
          <ShiritoriSessionProvider initialSession={createCompleteSession()}>{children}</ShiritoriSessionProvider>
        </MemoryRouter>
      ),
    })

    expect(screen.getByText('5もん できたね！')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'もういちど' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'ホームへ戻る' })).toBeInTheDocument()
  })
})
