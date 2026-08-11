import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { KanaGroupSessionProvider } from '../../features/kana-group/KanaGroupSessionProvider'
import { createKanaGroupQuestions } from '../../features/kana-group/model/kanaGroupQuestion'
import { createKanaGroupSession, nextKanaGroupQuestion, selectKanaGroupChoice } from '../../features/kana-group/model/kanaGroupSession'
import { KanaGroupResultPage } from './KanaGroupResultPage'

const createCompleteSession = () => {
  let session = createKanaGroupSession(createKanaGroupQuestions(() => 0.999), () => new Date('2026-08-11T13:00:00.000Z'), () => 0.999)
  for (let index = 0; index < 5; index += 1) {
    const question = session.questions[session.currentIndex]
    if (!question) throw new Error('テスト問題が見つかりません')
    session = nextKanaGroupQuestion(selectKanaGroupChoice(session, question.correctChoiceId))
  }
  return session
}

describe('KanaGroupResultPage', () => {
  it('shows a recoverable message without a completed session', () => {
    render(<KanaGroupResultPage />, {
      wrapper: ({ children }) => (
        <MemoryRouter>
          <KanaGroupSessionProvider>{children}</KanaGroupSessionProvider>
        </MemoryRouter>
      ),
    })

    expect(screen.getByText('結果を表示できません。')).toBeInTheDocument()
  })

  it('shows the completion message and actions', () => {
    render(<KanaGroupResultPage />, {
      wrapper: ({ children }) => (
        <MemoryRouter>
          <KanaGroupSessionProvider initialSession={createCompleteSession()}>{children}</KanaGroupSessionProvider>
        </MemoryRouter>
      ),
    })

    expect(screen.getByText('5もん できたね！')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'もういちど' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'ホームへ戻る' })).toBeInTheDocument()
  })
})
