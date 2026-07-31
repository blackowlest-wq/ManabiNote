import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, useLocation } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { loadStrokeQuestionsForRow } from '../../features/question-types/kana-to-stroke/model/loader'
import { StrokePracticeProvider } from '../../features/stroke-order/StrokePracticeProvider'
import {
  advanceCharacter,
  createPracticeSession,
  recordStrokeSuccess,
  type PracticeSession,
} from '../../features/stroke-order/model/practiceSession'
import { StrokeResultPage } from './StrokeResultPage'

function LocationProbe() {
  const location = useLocation()
  return <span data-testid="location">{location.pathname}</span>
}

const makeCompleteSession = (): PracticeSession => {
  const questions = loadStrokeQuestionsForRow('ka')
  let session = createPracticeSession(questions, 'ka', () => new Date('2026-07-31T10:00:00.000Z'))

  for (let questionIndex = 0; questionIndex < questions.length; questionIndex += 1) {
    for (let strokeIndex = 0; strokeIndex < session.questions[questionIndex].strokes.length; strokeIndex += 1) {
      session = recordStrokeSuccess(session)
    }
    session = advanceCharacter(session)
  }

  return session
}

const renderResult = (initialSession?: PracticeSession) =>
  render(
    <MemoryRouter>
      <StrokePracticeProvider initialSession={initialSession}>
        <StrokeResultPage />
        <LocationProbe />
      </StrokePracticeProvider>
    </MemoryRouter>,
  )

describe('StrokeResultPage', () => {
  it('shows a recoverable state without a completed result', () => {
    renderResult()

    expect(screen.getByRole('heading', { name: 'れんしゅう結果' })).toBeInTheDocument()
    expect(screen.getByText('結果を表示できません。')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'ホームへ戻る' })).toBeInTheDocument()
  })

  it('shows the selected row, lists its kana, and can restart practice', async () => {
    const user = userEvent.setup()
    renderResult(makeCompleteSession())

    expect(screen.getByRole('heading', { name: 'か行の 5もじ できたよ' })).toBeInTheDocument()
    expect(screen.getAllByRole('listitem').map((item) => item.textContent?.[0])).toEqual(['か', 'き', 'く', 'け', 'こ'])

    await user.click(screen.getByRole('button', { name: 'もう一度れんしゅう' }))

    expect(screen.getByTestId('location')).toHaveTextContent('/stroke-order')
  })
})
