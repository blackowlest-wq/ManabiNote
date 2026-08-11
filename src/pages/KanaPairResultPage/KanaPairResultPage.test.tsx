import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { KanaPairSessionProvider } from '../../features/kana-pair/KanaPairSessionProvider'
import { createKanaPairQuestions } from '../../features/kana-pair/model/kanaPairQuestion'
import { createKanaPairSession, nextKanaPairQuestion, selectKanaPairChoice } from '../../features/kana-pair/model/kanaPairSession'
import { KanaPairResultPage } from './KanaPairResultPage'

const createCompleteSession = () => {
  let session = createKanaPairSession(createKanaPairQuestions(() => 0.999), () => new Date('2026-08-11T11:00:00.000Z'), () => 0.999)
  for (let index = 0; index < 5; index += 1) {
    const question = session.questions[session.currentIndex]
    if (!question) throw new Error('テスト問題が見つかりません')
    session = nextKanaPairQuestion(selectKanaPairChoice(session, question.correctChoiceId))
  }
  return session
}

describe('KanaPairResultPage', () => {
  it('shows a recoverable message without a completed session', () => {
    render(<KanaPairResultPage />, {
      wrapper: ({ children }) => (
        <MemoryRouter>
          <KanaPairSessionProvider>{children}</KanaPairSessionProvider>
        </MemoryRouter>
      ),
    })

    expect(screen.getByText('結果を表示できません。')).toBeInTheDocument()
  })

  it('shows the completion message and actions', () => {
    render(<KanaPairResultPage />, {
      wrapper: ({ children }) => (
        <MemoryRouter>
          <KanaPairSessionProvider initialSession={createCompleteSession()}>{children}</KanaPairSessionProvider>
        </MemoryRouter>
      ),
    })

    expect(screen.getByText('5もん できたね！')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'もういちど' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'ホームへ戻る' })).toBeInTheDocument()
  })
})
