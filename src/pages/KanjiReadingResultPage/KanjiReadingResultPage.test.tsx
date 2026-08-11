import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { KanjiReadingSessionProvider } from '../../features/kanji-reading/KanjiReadingSessionProvider'
import { createKanjiReadingQuestions } from '../../features/kanji-reading/model/kanjiReadingQuestion'
import { createKanjiReadingSession } from '../../features/kanji-reading/model/kanjiReadingSession'
import { KanjiReadingResultPage } from './KanjiReadingResultPage'

const questions = createKanjiReadingQuestions(() => 0.999)
const session = createKanjiReadingSession(questions, () => new Date('2026-08-11T10:00:00.000Z'), () => 0.999)
const completedSession = { ...session, currentIndex: session.questions.length }

const renderPage = () => render(
  <MemoryRouter initialEntries={['/kanji-reading/result']}>
    <KanjiReadingSessionProvider initialSession={completedSession}>
      <Routes>
        <Route path="/kanji-reading/result" element={<KanjiReadingResultPage />} />
        <Route path="/kanji-reading" element={<p>ゲームページ</p>} />
      </Routes>
    </KanjiReadingSessionProvider>
  </MemoryRouter>,
)

describe('KanjiReadingResultPage', () => {
  it('shows the completion message and menu link', () => {
    renderPage()

    expect(screen.getByRole('heading', { name: 'かんじの れんしゅう おわり！' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'かんじの メニューへ' })).toHaveAttribute('href', '/kanji')
  })

  it('starts another game from retry', async () => {
    const user = userEvent.setup()
    renderPage()

    await user.click(screen.getByRole('button', { name: 'もういちど' }))

    expect(screen.getByText('ゲームページ')).toBeInTheDocument()
  })
})
