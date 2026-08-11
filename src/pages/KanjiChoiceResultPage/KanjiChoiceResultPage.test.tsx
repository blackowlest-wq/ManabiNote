import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { KanjiChoiceSessionProvider } from '../../features/kanji-choice/KanjiChoiceSessionProvider'
import { createKanjiChoiceQuestions } from '../../features/kanji-choice/model/kanjiChoiceQuestion'
import { createKanjiChoiceSession } from '../../features/kanji-choice/model/kanjiChoiceSession'
import { KanjiChoiceResultPage } from './KanjiChoiceResultPage'

const session = createKanjiChoiceSession(
  createKanjiChoiceQuestions(() => 0.999),
  () => new Date('2026-08-11T10:00:00.000Z'),
  () => 0.999,
)
const completedSession = { ...session, currentIndex: session.questions.length }

const renderPage = () => render(
  <MemoryRouter initialEntries={['/kanji-choice/result']}>
    <KanjiChoiceSessionProvider initialSession={completedSession}>
      <Routes>
        <Route path="/kanji-choice/result" element={<KanjiChoiceResultPage />} />
        <Route path="/kanji-choice" element={<p>ゲームページ</p>} />
      </Routes>
    </KanjiChoiceSessionProvider>
  </MemoryRouter>,
)

describe('KanjiChoiceResultPage', () => {
  it('shows the completion message and menu link', () => {
    renderPage()

    expect(screen.getByRole('heading', { name: 'かんじえらび おわり！' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'かんじの メニューへ' })).toHaveAttribute('href', '/kanji')
  })

  it('starts another game from retry', async () => {
    const user = userEvent.setup()
    renderPage()

    await user.click(screen.getByRole('button', { name: 'もういちど' }))

    expect(screen.getByText('ゲームページ')).toBeInTheDocument()
  })
})
