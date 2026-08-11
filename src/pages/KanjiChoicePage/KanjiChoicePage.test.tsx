import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { KanjiChoiceSessionProvider } from '../../features/kanji-choice/KanjiChoiceSessionProvider'
import { createKanjiChoiceQuestions } from '../../features/kanji-choice/model/kanjiChoiceQuestion'
import { createKanjiChoiceSession } from '../../features/kanji-choice/model/kanjiChoiceSession'
import { KanjiChoicePage } from './KanjiChoicePage'

const initialSession = createKanjiChoiceSession(
  createKanjiChoiceQuestions(() => 0.999),
  () => new Date('2026-08-11T10:00:00.000Z'),
  () => 0.999,
)

const renderPage = () => render(
  <MemoryRouter initialEntries={['/kanji-choice']}>
    <KanjiChoiceSessionProvider initialSession={initialSession}>
      <Routes>
        <Route path="/kanji-choice" element={<KanjiChoicePage />} />
        <Route path="/kanji-choice/result" element={<p>けっかページ</p>} />
      </Routes>
    </KanjiChoiceSessionProvider>
  </MemoryRouter>,
)

describe('KanjiChoicePage', () => {
  it('shows progress and kanji choices', () => {
    renderPage()

    expect(screen.getByText('1 / 5')).toBeInTheDocument()
    expect(screen.getByRole('group', { name: 'かんじをえらぶ' })).toBeInTheDocument()
  })

  it('advances after the matching kanji is selected', async () => {
    const user = userEvent.setup()
    const question = initialSession.questions[0]
    if (!question) throw new Error('問題がありません')
    const correctChoice = question.choices.find((choice) => choice.id === question.correctChoiceId)
    if (!correctChoice) throw new Error('正解がありません')
    renderPage()

    await user.click(screen.getByRole('button', { name: correctChoice.kanji }))
    await user.click(screen.getByRole('button', { name: 'つぎへ' }))

    expect(screen.getByText('2 / 5')).toBeInTheDocument()
  })
})
