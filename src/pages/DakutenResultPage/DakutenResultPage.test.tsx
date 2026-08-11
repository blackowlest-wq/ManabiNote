import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { DakutenSessionProvider } from '../../features/dakuten/DakutenSessionProvider'
import { createDakutenQuestions } from '../../features/dakuten/model/dakutenQuestion'
import { createDakutenSession, nextDakutenQuestion, selectDakutenChoice } from '../../features/dakuten/model/dakutenSession'
import { DakutenResultPage } from './DakutenResultPage'

const createCompleteSession = () => {
  let session = createDakutenSession(createDakutenQuestions(() => 0.999), () => new Date('2026-08-11T12:00:00.000Z'), () => 0.999)
  for (let index = 0; index < 5; index += 1) {
    const question = session.questions[session.currentIndex]
    if (!question) throw new Error('テスト問題が見つかりません')
    session = nextDakutenQuestion(selectDakutenChoice(session, question.correctChoiceId))
  }
  return session
}

describe('DakutenResultPage', () => {
  it('shows a recoverable message without a completed session', () => {
    render(<DakutenResultPage />, {
      wrapper: ({ children }) => (
        <MemoryRouter>
          <DakutenSessionProvider>{children}</DakutenSessionProvider>
        </MemoryRouter>
      ),
    })

    expect(screen.getByText('結果を表示できません。')).toBeInTheDocument()
  })

  it('shows the completion message and actions', () => {
    render(<DakutenResultPage />, {
      wrapper: ({ children }) => (
        <MemoryRouter>
          <DakutenSessionProvider initialSession={createCompleteSession()}>{children}</DakutenSessionProvider>
        </MemoryRouter>
      ),
    })

    expect(screen.getByText('5もん できたね！')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'もういちど' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'ホームへ戻る' })).toBeInTheDocument()
  })
})
