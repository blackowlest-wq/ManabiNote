import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { ReadingComprehensionSessionProvider } from '../../features/reading-comprehension/ReadingComprehensionSessionProvider'
import { createReadingComprehensionQuestions } from '../../features/reading-comprehension/model/readingComprehensionQuestion'
import { createReadingComprehensionSession } from '../../features/reading-comprehension/model/readingComprehensionSession'
import { ReadingComprehensionPage } from './ReadingComprehensionPage'

const initialSession = createReadingComprehensionSession(
  'normal',
  createReadingComprehensionQuestions('normal', () => 0.999),
  () => new Date('2026-08-11T10:00:00.000Z'),
  () => 0.999,
)

const renderPage = (session: typeof initialSession | null = initialSession) => render(
  <MemoryRouter initialEntries={['/reading-comprehension']}>
    <ReadingComprehensionSessionProvider initialSession={session ?? undefined}>
      <Routes>
        <Route path="/reading-comprehension" element={<ReadingComprehensionPage />} />
        <Route path="/reading-comprehension/result" element={<p>けっかページ</p>} />
      </Routes>
    </ReadingComprehensionSessionProvider>
  </MemoryRouter>,
)

describe('ReadingComprehensionPage', () => {
  it('starts after selecting a difficulty', async () => {
    const user = userEvent.setup()
    renderPage(null)

    await user.click(screen.getByRole('button', { name: /むずかしい/ }))

    expect(screen.getByText('1 / 5')).toBeInTheDocument()
  })

  it('shows progress and a reading question', () => {
    renderPage()

    expect(screen.getByText('1 / 5')).toBeInTheDocument()
    expect(screen.getByRole('group', { name: 'こたえをえらぶ' })).toBeInTheDocument()
  })

  it('advances after the correct answer is selected', async () => {
    const user = userEvent.setup()
    const question = initialSession.questions[0]
    if (!question) throw new Error('問題がありません')
    const correctChoice = question.choices.find((choice) => choice.id === question.correctChoiceId)
    if (!correctChoice) throw new Error('正解がありません')
    renderPage()

    await user.click(screen.getByRole('button', { name: correctChoice.text }))
    await user.click(screen.getByRole('button', { name: 'つぎへ' }))

    expect(screen.getByText('2 / 5')).toBeInTheDocument()
  })
})
