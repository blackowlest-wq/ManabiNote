import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { NumberCompareSessionProvider } from '../../features/number-compare/NumberCompareSessionProvider'
import { createNumberCompareQuestions } from '../../features/number-compare/model/numberCompareQuestion'
import { createNumberCompareSession, nextNumberCompareQuestion, selectNumberCompareChoice } from '../../features/number-compare/model/numberCompareSession'
import { NumberCompareResultPage } from './NumberCompareResultPage'

const makeCompleteSession = () => {
  let session = createNumberCompareSession(
    createNumberCompareQuestions(() => 0.999),
    () => new Date('2026-08-11T10:00:00.000Z'),
    () => 0.999,
  )
  for (let index = 0; index < session.questions.length; index += 1) {
    const question = session.questions[session.currentIndex]
    if (!question) throw new Error('問題がありません')
    session = nextNumberCompareQuestion(selectNumberCompareChoice(session, question.correctChoiceId))
  }
  return session
}

describe('NumberCompareResultPage', () => {
  it('shows the completed result', () => {
    render(
      <MemoryRouter initialEntries={['/number-compare/result']}>
        <NumberCompareSessionProvider initialSession={makeCompleteSession()}>
          <Routes>
            <Route path="/number-compare/result" element={<NumberCompareResultPage />} />
          </Routes>
        </NumberCompareSessionProvider>
      </MemoryRouter>,
    )

    expect(screen.getByRole('heading', { name: 'かずの れんしゅう おわり！' })).toBeInTheDocument()
    expect(screen.getByText('5もん できたね！')).toBeInTheDocument()
  })

  it('offers a retry action', async () => {
    const user = userEvent.setup()
    render(
      <MemoryRouter initialEntries={['/number-compare/result']}>
        <NumberCompareSessionProvider initialSession={makeCompleteSession()}>
          <Routes>
            <Route path="/number-compare/result" element={<NumberCompareResultPage />} />
            <Route path="/number-compare" element={<p>ゲームページ</p>} />
          </Routes>
        </NumberCompareSessionProvider>
      </MemoryRouter>,
    )

    await user.click(screen.getByRole('button', { name: 'もういちど' }))

    expect(screen.getByText('ゲームページ')).toBeInTheDocument()
  })
})
