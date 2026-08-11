import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { loadKanaToPictureQuestions } from '../../features/question-types/kana-to-picture/model/loader'
import { MemorySessionProvider } from '../../features/memory/MemorySessionProvider'
import { createMemorySession, flipMemoryCard } from '../../features/memory/model/memorySession'
import { MemoryResultPage } from './MemoryResultPage'

const questions = loadKanaToPictureQuestions()
const createCompleteSession = () => {
  let session = createMemorySession(questions, () => new Date('2026-08-11T14:00:00.000Z'), () => 0.999)
  for (const pair of session.pairs) {
    const kanaCard = session.cards.find((card) => card.pairId === pair.id && card.kind === 'kana')
    const pictureCard = session.cards.find((card) => card.pairId === pair.id && card.kind === 'picture')
    if (!kanaCard || !pictureCard) throw new Error('テストカードが見つかりません')
    session = flipMemoryCard(flipMemoryCard(session, kanaCard.id), pictureCard.id)
  }
  return session
}

describe('MemoryResultPage', () => {
  it('shows a recoverable message without a completed session', () => {
    render(<MemoryResultPage />, {
      wrapper: ({ children }) => (
        <MemoryRouter>
          <MemorySessionProvider>{children}</MemorySessionProvider>
        </MemoryRouter>
      ),
    })

    expect(screen.getByText('結果を表示できません。')).toBeInTheDocument()
  })

  it('shows the number of moves and retry action', () => {
    render(<MemoryResultPage />, {
      wrapper: ({ children }) => (
        <MemoryRouter>
          <MemorySessionProvider initialSession={createCompleteSession()}>{children}</MemorySessionProvider>
        </MemoryRouter>
      ),
    })

    expect(screen.getByText('4かいで 4くみ そろえたね！')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'もういちど' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'ホームへ戻る' })).toBeInTheDocument()
  })
})
