import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import { GAME_CATEGORIES } from '../../app/gameCategories'
import { loadStrokeQuestionsForRow } from '../../features/question-types/kana-to-stroke/model/loader'
import { StrokePracticeProvider } from '../../features/stroke-order/StrokePracticeProvider'
import {
  advanceCharacter,
  createPracticeSession,
  recordStrokeSuccess,
  type PracticeSession,
} from '../../features/stroke-order/model/practiceSession'
import { CategoryPage } from '../CategoryPage/CategoryPage'
import { HomePage } from '../HomePage/HomePage'
import { StrokeOrderPage } from './StrokeOrderPage'

vi.mock('../../features/question-types/kana-to-stroke/components/StrokeCanvas', () => ({
  StrokeCanvas: ({
    onStrokeResult,
    question,
    showFailureHint = false,
    completedStrokeIndexes = [],
  }: {
    onStrokeResult: (result: { accepted: boolean; reason: 'accepted' | 'incomplete'; progress: number }) => void
    question: { kana: string }
    showFailureHint?: boolean
    completedStrokeIndexes?: readonly number[]
  }) => (
    <div>
      <p>mock canvas {question.kana}</p>
      <span data-testid="stroke-guide-visibility">{showFailureHint ? 'shown' : 'hidden'}</span>
      <span data-testid="completed-strokes">{completedStrokeIndexes.join(',')}</span>
      <button
        type="button"
        onClick={() => onStrokeResult({ accepted: true, reason: 'accepted', progress: 1 })}
      >
        mock success
      </button>
      <button
        type="button"
        onClick={() => onStrokeResult({ accepted: false, reason: 'incomplete', progress: 0 })}
      >
        mock failure
      </button>
    </div>
  ),
}))

function LocationProbe() {
  const location = useLocation()
  return <span data-testid="location">{location.pathname}</span>
}

const questions = loadStrokeQuestionsForRow('a')
const fixedClock = () => new Date('2026-07-31T10:00:00.000Z')

const activeSession = () => createPracticeSession(questions, 'a', fixedClock)

const characterCompleteSession = (): PracticeSession => {
  let session = activeSession()
  for (let index = 0; index < session.questions[0].strokes.length; index += 1) {
    session = recordStrokeSuccess(session)
  }
  return session
}

const finalStrokeSession = (): PracticeSession => {
  let session = activeSession()
  for (let index = 0; index < session.questions[0].strokes.length - 1; index += 1) {
    session = recordStrokeSuccess(session)
  }
  return session
}

const completeSession = (): PracticeSession => {
  let session = activeSession()
  for (let questionIndex = 0; questionIndex < questions.length; questionIndex += 1) {
    for (let strokeIndex = 0; strokeIndex < session.questions[questionIndex].strokes.length; strokeIndex += 1) {
      session = recordStrokeSuccess(session)
    }
    session = advanceCharacter(session)
  }
  return session
}

const renderPage = (initialSession?: PracticeSession) =>
  render(
    <MemoryRouter>
      <StrokePracticeProvider initialSession={initialSession}>
        <StrokeOrderPage />
        <LocationProbe />
      </StrokePracticeProvider>
    </MemoryRouter>,
  )

describe('StrokeOrderPage', () => {
  it('shows a recoverable start state without a session', () => {
    renderPage()

    expect(screen.getByRole('heading', { name: '書き順れんしゅう' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'あ行' })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByRole('button', { name: 'か行' })).toHaveAttribute('aria-pressed', 'false')
    const rowOptions = screen.getByTestId('stroke-row-options')
    const startButton = screen.getByRole('button', { name: 'れんしゅうをはじめる' })
    const homeLink = screen.getByRole('link', { name: 'ホームへ戻る' })
    expect(startButton.compareDocumentPosition(rowOptions) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    expect(homeLink.compareDocumentPosition(rowOptions) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
  })

  it('starts the selected row and shows its first character', async () => {
    const user = userEvent.setup()
    renderPage()

    await user.click(screen.getByRole('button', { name: 'か行' }))
    await user.click(screen.getByRole('button', { name: 'れんしゅうをはじめる' }))

    expect(screen.getByRole('heading', { name: 'か' })).toBeInTheDocument()
    expect(screen.getByText('1 / 5')).toBeInTheDocument()
  })

  it('uses the shorter progress count for や行', async () => {
    const user = userEvent.setup()
    renderPage()

    await user.click(screen.getByRole('button', { name: 'や行' }))
    await user.click(screen.getByRole('button', { name: 'れんしゅうをはじめる' }))

    expect(screen.getByRole('heading', { name: 'や' })).toBeInTheDocument()
    expect(screen.getByText('1 / 3')).toBeInTheDocument()
  })

  it('shows あ and the first stroke for an active session', () => {
    renderPage(activeSession())

    expect(screen.getByRole('heading', { name: 'あ' })).toBeInTheDocument()
    expect(screen.getByText('1 / 5')).toBeInTheDocument()
    expect(screen.getByText(/1画目/)).toBeInTheDocument()
  })

  it('keeps feedback and next-action slots mounted before interaction', () => {
    renderPage(activeSession())

    expect(screen.getByTestId('stroke-feedback-slot')).toBeInTheDocument()
    expect(screen.getByTestId('stroke-next-slot')).toBeInTheDocument()
  })

  it('advances the stroke after an accepted result', async () => {
    const user = userEvent.setup()
    renderPage(activeSession())

    await user.click(screen.getByRole('button', { name: 'mock success' }))

    expect(screen.getByText(/2画目/)).toBeInTheDocument()
    expect(screen.getByRole('status')).toHaveTextContent('できたよ！')
  })

  it('marks the final stroke as completed after it is accepted', async () => {
    const user = userEvent.setup()
    renderPage(finalStrokeSession())

    await user.click(screen.getByRole('button', { name: 'mock success' }))

    expect(screen.getByTestId('completed-strokes')).toHaveTextContent('0,1,2')
  })

  it('shows a retry message without advancing after a rejected result', async () => {
    const user = userEvent.setup()
    renderPage(activeSession())

    await user.click(screen.getByRole('button', { name: 'mock failure' }))

    expect(screen.getByRole('status')).toHaveTextContent('もういちど なぞってみよう')
    expect(screen.getByText(/1画目/)).toBeInTheDocument()
  })

  it('reveals the start hint only after the first failed trace', async () => {
    const user = userEvent.setup()
    renderPage(activeSession())

    expect(screen.getByTestId('stroke-guide-visibility')).toHaveTextContent('hidden')

    await user.click(screen.getByRole('button', { name: 'mock failure' }))

    expect(screen.getByTestId('stroke-guide-visibility')).toHaveTextContent('shown')
  })

  it('moves to い after the current character is complete', async () => {
    const user = userEvent.setup()
    renderPage(characterCompleteSession())

    await user.click(screen.getByRole('button', { name: 'つぎの文字へ' }))

    expect(screen.getByRole('heading', { name: 'い' })).toBeInTheDocument()
  })

  it('navigates to the result page after the final character', async () => {
    const user = userEvent.setup()
    renderPage(completeSession())

    await user.click(screen.getByRole('button', { name: 'けっかを見る' }))

    expect(screen.getByTestId('location')).toHaveTextContent('/stroke-order/result')
  })

  it('starts with row selection after returning from a result through home', async () => {
    const user = userEvent.setup()

    render(
      <MemoryRouter initialEntries={['/']}>
        <StrokePracticeProvider initialSession={completeSession()}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/words" element={<CategoryPage {...GAME_CATEGORIES.words} />} />
            <Route path="/stroke-order" element={<StrokeOrderPage />} />
          </Routes>
        </StrokePracticeProvider>
      </MemoryRouter>,
    )

    await user.click(screen.getByRole('link', { name: 'ことば' }))
    await user.click(screen.getByRole('link', { name: '書き順れんしゅう' }))

    expect(screen.getByRole('button', { name: 'れんしゅうをはじめる' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'けっかを見る' })).not.toBeInTheDocument()
  })
})
