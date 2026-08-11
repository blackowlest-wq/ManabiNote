import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { SmallKanaSessionProvider } from '../../features/small-kana/SmallKanaSessionProvider'
import { createSmallKanaQuestions } from '../../features/small-kana/model/smallKanaQuestion'
import { createSmallKanaSession, nextSmallKanaQuestion, selectSmallKanaChoice } from '../../features/small-kana/model/smallKanaSession'
import { SmallKanaResultPage } from './SmallKanaResultPage'

const createCompleteSession = () => {
  let session = createSmallKanaSession(createSmallKanaQuestions(() => 0.999), () => new Date('2026-08-11T14:00:00.000Z'), () => 0.999)
  for (let index = 0; index < 5; index += 1) {
    const question = session.questions[session.currentIndex]
    if (!question) throw new Error('テスト問題が見つかりません')
    session = nextSmallKanaQuestion(selectSmallKanaChoice(session, question.correctChoiceId))
  }
  return session
}

describe('SmallKanaResultPage', () => {
  it('shows a recoverable message without a completed session', () => {
    render(<SmallKanaResultPage />, {
      wrapper: ({ children }) => (
        <MemoryRouter>
          <SmallKanaSessionProvider>{children}</SmallKanaSessionProvider>
        </MemoryRouter>
      ),
    })

    expect(screen.getByText('結果を表示できません。')).toBeInTheDocument()
  })

  it('shows the completion message and actions', () => {
    render(<SmallKanaResultPage />, {
      wrapper: ({ children }) => (
        <MemoryRouter>
          <SmallKanaSessionProvider initialSession={createCompleteSession()}>{children}</SmallKanaSessionProvider>
        </MemoryRouter>
      ),
    })

    expect(screen.getByText('5もん できたね！')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'もういちど' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'ホームへ戻る' })).toBeInTheDocument()
  })
})
