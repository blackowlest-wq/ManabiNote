import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import { GAME_CATEGORIES } from '../../app/gameCategories'
import { loadKanjiStrokeQuestions } from '../../features/question-types/kanji-to-stroke/model/loader'
import { KanjiStrokePracticeProvider } from '../../features/stroke-order/KanjiStrokePracticeProvider'
import {
  advanceKanjiCharacter,
  createKanjiPracticeSession,
  recordKanjiStrokeSuccess,
  type KanjiPracticeSession,
} from '../../features/stroke-order/model/kanjiPracticeSession'
import { CategoryPage } from '../CategoryPage/CategoryPage'
import { HomePage } from '../HomePage/HomePage'
import { KanjiStrokeOrderPage } from './KanjiStrokeOrderPage'

vi.mock('../../features/question-types/kana-to-stroke/components/StrokeCanvas', () => ({
  StrokeCanvas: ({
    onStrokeResult,
    question,
    showFailureHint = false,
    completedStrokeIndexes = [],
  }: {
    onStrokeResult: (result: { accepted: boolean; reason: 'accepted' | 'incomplete'; progress: number }) => void
    question: { kanji: string }
    showFailureHint?: boolean
    completedStrokeIndexes?: readonly number[]
  }) => (
    <div>
      <p>mock canvas {question.kanji}</p>
      <span data-testid="kanji-stroke-guide-visibility">{showFailureHint ? 'shown' : 'hidden'}</span>
      <span data-testid="kanji-completed-strokes">{completedStrokeIndexes.join(',')}</span>
      <button type="button" onClick={() => onStrokeResult({ accepted: true, reason: 'accepted', progress: 1 })}>
        mock success
      </button>
      <button type="button" onClick={() => onStrokeResult({ accepted: false, reason: 'incomplete', progress: 0 })}>
        mock failure
      </button>
    </div>
  ),
}))

function LocationProbe() {
  const location = useLocation()
  return <span data-testid="location">{location.pathname}</span>
}

const questions = loadKanjiStrokeQuestions()
const fixedClock = () => new Date('2026-08-13T10:00:00.000Z')

const activeSession = () => createKanjiPracticeSession(questions, fixedClock, () => 0.999)

const completeSession = (): KanjiPracticeSession => {
  let session = activeSession()
  for (let questionIndex = 0; questionIndex < session.questions.length; questionIndex += 1) {
    for (let strokeIndex = 0; strokeIndex < session.questions[questionIndex].strokes.length; strokeIndex += 1) {
      session = recordKanjiStrokeSuccess(session)
    }
    session = advanceKanjiCharacter(session)
  }
  return session
}

const renderPage = (initialSession?: KanjiPracticeSession) => render(
  <MemoryRouter>
    <KanjiStrokePracticeProvider initialSession={initialSession}>
      <KanjiStrokeOrderPage />
      <LocationProbe />
    </KanjiStrokePracticeProvider>
  </MemoryRouter>,
)

describe('KanjiStrokeOrderPage', () => {
  it('shows a start state and begins a five-kanji practice', async () => {
    const user = userEvent.setup()
    renderPage()

    expect(screen.getByRole('heading', { name: 'かんじの 書き順' })).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'れんしゅうをはじめる' }))

    expect(screen.getByText('1 / 5')).toBeInTheDocument()
    expect(screen.getByText(/1画目/)).toBeInTheDocument()
  })

  it('shows the orange hint only after a failed trace', async () => {
    const user = userEvent.setup()
    renderPage(activeSession())

    expect(screen.getByTestId('kanji-stroke-guide-visibility')).toHaveTextContent('hidden')
    await user.click(screen.getByRole('button', { name: 'mock failure' }))
    expect(screen.getByTestId('kanji-stroke-guide-visibility')).toHaveTextContent('shown')
  })

  it('returns to the start state after entering from home with an old complete session', async () => {
    const user = userEvent.setup()

    render(
      <MemoryRouter initialEntries={['/']}>
        <KanjiStrokePracticeProvider initialSession={completeSession()}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/kanji" element={<CategoryPage {...GAME_CATEGORIES.kanji} />} />
            <Route path="/kanji-stroke-order" element={<KanjiStrokeOrderPage />} />
          </Routes>
        </KanjiStrokePracticeProvider>
      </MemoryRouter>,
    )

    await user.click(screen.getByRole('link', { name: 'かんじ' }))
    await user.click(screen.getByRole('link', { name: 'かんじの 書き順' }))

    expect(screen.getByRole('button', { name: 'れんしゅうをはじめる' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'けっかを見る' })).not.toBeInTheDocument()
  })
})
