import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { loadKanaToPictureQuestions } from '../../features/question-types/kana-to-picture/model/loader'
import { MemorySessionProvider } from '../../features/memory/MemorySessionProvider'
import { createMemorySession, flipMemoryCard } from '../../features/memory/model/memorySession'
import { MemoryPage } from './MemoryPage'

const questions = loadKanaToPictureQuestions()
const initialSession = createMemorySession(
  questions,
  () => new Date('2026-08-11T14:00:00.000Z'),
  () => 0.999,
)

const renderPage = (session = initialSession) => render(
  <MemoryRouter initialEntries={['/memory']}>
    <MemorySessionProvider initialSession={session}>
      <Routes>
        <Route path="/memory" element={<MemoryPage />} />
        <Route path="/memory/result" element={<p>けっかページ</p>} />
      </Routes>
    </MemorySessionProvider>
  </MemoryRouter>,
)

const hiddenCardName = (cardId: string, session = initialSession) => {
  const cardIndex = session.cards.findIndex((card) => card.id === cardId)
  if (cardIndex < 0) throw new Error('テストカードが見つかりません')
  return `うらむきカード ${cardIndex + 1}`
}

const createCompleteSession = () => {
  let session = initialSession
  for (const pair of session.pairs) {
    const kanaCard = session.cards.find((card) => card.pairId === pair.id && card.kind === 'kana')
    const pictureCard = session.cards.find((card) => card.pairId === pair.id && card.kind === 'picture')
    if (!kanaCard || !pictureCard) throw new Error('テストカードが見つかりません')
    session = flipMemoryCard(flipMemoryCard(session, kanaCard.id), pictureCard.id)
  }
  return session
}

describe('MemoryPage', () => {
  it('shows four pairs and eight face-down cards', () => {
    renderPage()

    expect(screen.getByText('0 / 4 くみ')).toBeInTheDocument()
    expect(screen.getByRole('grid', { name: 'カードをえらぶ' })).toBeInTheDocument()
    expect(screen.getAllByRole('button')).toHaveLength(8)
  })

  it('reveals and matches a kana and picture pair', async () => {
    const pair = initialSession.pairs[0]
    if (!pair) throw new Error('テストペアが見つかりません')
    const kanaCard = initialSession.cards.find((card) => card.pairId === pair.id && card.kind === 'kana')
    const pictureCard = initialSession.cards.find((card) => card.pairId === pair.id && card.kind === 'picture')
    if (!kanaCard || !pictureCard) throw new Error('テストカードが見つかりません')

    const user = (await import('@testing-library/user-event')).default.setup()
    renderPage()
    await user.click(screen.getByRole('button', { name: hiddenCardName(kanaCard.id) }))
    await user.click(screen.getByRole('button', { name: hiddenCardName(pictureCard.id) }))

    expect(screen.getByText('1 / 4 くみ')).toBeInTheDocument()
    expect(screen.getByText('せいかい！')).toBeInTheDocument()
  })

  it('offers the result after all pairs are matched', async () => {
    const user = (await import('@testing-library/user-event')).default.setup()
    renderPage(createCompleteSession())

    await user.click(screen.getByRole('button', { name: 'けっかを みる' }))

    expect(screen.getByText('けっかページ')).toBeInTheDocument()
  })
})
