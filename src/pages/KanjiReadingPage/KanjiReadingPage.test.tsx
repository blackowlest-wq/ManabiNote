import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { KanjiReadingSessionProvider } from '../../features/kanji-reading/KanjiReadingSessionProvider'
import { createKanjiReadingQuestions } from '../../features/kanji-reading/model/kanjiReadingQuestion'
import { createKanjiReadingSession } from '../../features/kanji-reading/model/kanjiReadingSession'
import { KanjiReadingPage } from './KanjiReadingPage'

const initialSession = createKanjiReadingSession(
  createKanjiReadingQuestions(() => 0.999),
  () => new Date('2026-08-11T10:00:00.000Z'),
  () => 0.999,
)

const renderPage = (session = initialSession) => render(
  <MemoryRouter initialEntries={['/kanji-reading']}>
    <KanjiReadingSessionProvider initialSession={session}>
      <Routes>
        <Route path="/kanji-reading" element={<KanjiReadingPage />} />
        <Route path="/kanji-reading/result" element={<p>けっかページ</p>} />
      </Routes>
    </KanjiReadingSessionProvider>
  </MemoryRouter>,
)

describe('KanjiReadingPage', () => {
  it('shows progress and a kanji reading question', () => {
    renderPage()

    expect(screen.getByText('1 / 5')).toBeInTheDocument()
    expect(screen.getByRole('group', { name: 'よみかたをえらぶ' })).toBeInTheDocument()
  })

  it('advances after the correct reading is selected', async () => {
    const user = userEvent.setup()
    const question = initialSession.questions[0]
    if (!question) throw new Error('問題がありません')
    const correctChoice = question.choices.find((choice) => choice.id === question.correctChoiceId)
    if (!correctChoice) throw new Error('正解がありません')
    renderPage()

    await user.click(screen.getByRole('button', { name: correctChoice.reading }))
    await user.click(screen.getByRole('button', { name: 'つぎへ' }))

    expect(screen.getByText('2 / 5')).toBeInTheDocument()
  })
})
