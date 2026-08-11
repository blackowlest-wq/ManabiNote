import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { ReadingComprehensionSessionProvider } from '../../features/reading-comprehension/ReadingComprehensionSessionProvider'
import { createReadingComprehensionQuestions } from '../../features/reading-comprehension/model/readingComprehensionQuestion'
import { createReadingComprehensionSession } from '../../features/reading-comprehension/model/readingComprehensionSession'
import { ReadingComprehensionResultPage } from './ReadingComprehensionResultPage'

const session = createReadingComprehensionSession(
  'hard',
  createReadingComprehensionQuestions('hard', () => 0.999),
  () => new Date('2026-08-11T10:00:00.000Z'),
  () => 0.999,
)
const completedSession = { ...session, currentIndex: session.questions.length }

const renderPage = () => render(
  <MemoryRouter initialEntries={['/reading-comprehension/result']}>
    <ReadingComprehensionSessionProvider initialSession={completedSession}>
      <Routes>
        <Route path="/reading-comprehension/result" element={<ReadingComprehensionResultPage />} />
        <Route path="/reading-comprehension" element={<p>ゲームページ</p>} />
      </Routes>
    </ReadingComprehensionSessionProvider>
  </MemoryRouter>,
)

describe('ReadingComprehensionResultPage', () => {
  it('shows the completed difficulty and menu link', () => {
    renderPage()

    expect(screen.getByRole('heading', { name: 'ぶんよみ おわり！' })).toBeInTheDocument()
    expect(screen.getByText('むずかしさ：むずかしい')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'ぶんの メニューへ' })).toHaveAttribute('href', '/sentences')
  })

  it('starts another game at the same difficulty', async () => {
    const user = userEvent.setup()
    renderPage()

    await user.click(screen.getByRole('button', { name: 'もういちど' }))

    expect(screen.getByText('ゲームページ')).toBeInTheDocument()
  })
})
