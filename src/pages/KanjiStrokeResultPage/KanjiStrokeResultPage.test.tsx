import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, useLocation } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { loadKanjiStrokeQuestions } from '../../features/question-types/kanji-to-stroke/model/loader'
import { KanjiStrokePracticeProvider } from '../../features/stroke-order/KanjiStrokePracticeProvider'
import {
  advanceKanjiCharacter,
  createKanjiPracticeSession,
  recordKanjiStrokeSuccess,
} from '../../features/stroke-order/model/kanjiPracticeSession'
import { KanjiStrokeResultPage } from './KanjiStrokeResultPage'

function LocationProbe() {
  const location = useLocation()
  return <span data-testid="location">{location.pathname}</span>
}

const completeSession = () => {
  let session = createKanjiPracticeSession(
    loadKanjiStrokeQuestions(),
    () => new Date('2026-08-13T10:00:00.000Z'),
    () => 0.999,
  )

  for (let questionIndex = 0; questionIndex < session.questions.length; questionIndex += 1) {
    for (let strokeIndex = 0; strokeIndex < session.questions[questionIndex].strokes.length; strokeIndex += 1) {
      session = recordKanjiStrokeSuccess(session)
    }
    session = advanceKanjiCharacter(session)
  }

  return session
}

describe('KanjiStrokeResultPage', () => {
  it('shows the selected kanji and can return to a fresh practice', async () => {
    const user = userEvent.setup()
    render(
      <MemoryRouter>
        <KanjiStrokePracticeProvider initialSession={completeSession()}>
          <KanjiStrokeResultPage />
          <LocationProbe />
        </KanjiStrokePracticeProvider>
      </MemoryRouter>,
    )

    expect(screen.getByRole('heading', { name: 'かんじの れんしゅう おわり！' })).toBeInTheDocument()
    expect(screen.getAllByRole('listitem')).toHaveLength(5)

    await user.click(screen.getByRole('button', { name: 'もう一度れんしゅう' }))
    expect(screen.getByTestId('location')).toHaveTextContent('/kanji-stroke-order')
  })
})
