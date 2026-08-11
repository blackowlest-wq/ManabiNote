import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { loadKanaToPictureQuestions } from '../../features/question-types/kana-to-picture/model/loader'
import { CountingSessionProvider } from '../../features/counting/CountingSessionProvider'
import { createCountingQuestions } from '../../features/counting/model/countingQuestion'
import { createCountingSession, nextCountingQuestion, selectCountingChoice } from '../../features/counting/model/countingSession'
import { CountingResultPage } from './CountingResultPage'

const createCompleteSession = () => {
  let session = createCountingSession(createCountingQuestions(loadKanaToPictureQuestions(), () => 0.999), () => new Date('2026-08-11T14:00:00.000Z'), () => 0.999)
  for (let index = 0; index < 5; index += 1) {
    const question = session.questions[session.currentIndex]
    if (!question) throw new Error('テスト問題が見つかりません')
    session = nextCountingQuestion(selectCountingChoice(session, question.correctChoiceId))
  }
  return session
}

describe('CountingResultPage', () => {
  it('shows a recoverable message without a completed session', () => {
    render(<CountingResultPage />, {
      wrapper: ({ children }) => (
        <MemoryRouter>
          <CountingSessionProvider>{children}</CountingSessionProvider>
        </MemoryRouter>
      ),
    })

    expect(screen.getByText('結果を表示できません。')).toBeInTheDocument()
  })

  it('shows the completion message and actions', () => {
    render(<CountingResultPage />, {
      wrapper: ({ children }) => (
        <MemoryRouter>
          <CountingSessionProvider initialSession={createCompleteSession()}>{children}</CountingSessionProvider>
        </MemoryRouter>
      ),
    })

    expect(screen.getByText('5もん できたね！')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'もういちど' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'ホームへ戻る' })).toBeInTheDocument()
  })
})
