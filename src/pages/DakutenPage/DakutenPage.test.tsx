import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { DakutenSessionProvider } from '../../features/dakuten/DakutenSessionProvider'
import { createDakutenQuestions } from '../../features/dakuten/model/dakutenQuestion'
import { createDakutenSession, nextDakutenQuestion, selectDakutenChoice } from '../../features/dakuten/model/dakutenSession'
import { DakutenPage } from './DakutenPage'

const questions = createDakutenQuestions(() => 0.999)
const initialSession = createDakutenSession(questions, () => new Date('2026-08-11T12:00:00.000Z'), () => 0.999)

const TestProvider = ({ children }: { children: React.ReactNode }) => (
  <DakutenSessionProvider initialSession={initialSession}>{children}</DakutenSessionProvider>
)

describe('DakutenPage', () => {
  it('shows progress, the marked character, and choices', () => {
    render(<DakutenPage />, {
      wrapper: ({ children }) => <MemoryRouter><TestProvider>{children}</TestProvider></MemoryRouter>,
    })

    expect(screen.getByText('1 / 5')).toBeInTheDocument()
    expect(screen.getByLabelText('かに゛')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'が' })).toBeInTheDocument()
  })

  it('allows retry and advances after the correct voiced character', async () => {
    const user = userEvent.setup()
    const question = initialSession.questions[0]
    if (!question) throw new Error('テスト問題が見つかりません')
    const wrongChoice = question.choices.find((choice) => choice.id !== question.correctChoiceId)
    if (!wrongChoice) throw new Error('不正解の選択肢が見つかりません')

    render(<DakutenPage />, {
      wrapper: ({ children }) => <MemoryRouter><TestProvider>{children}</TestProvider></MemoryRouter>,
    })

    await user.click(screen.getByRole('button', { name: wrongChoice.character }))
    expect(screen.getByText('もういちど えらんでね')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: question.answer }))
    await user.click(screen.getByRole('button', { name: 'つぎへ' }))
    expect(screen.getByText('2 / 5')).toBeInTheDocument()
  })

  it('navigates to the result page after the fifth answer', async () => {
    const user = userEvent.setup()
    let session = initialSession
    for (let index = 0; index < 4; index += 1) {
      const question = session.questions[session.currentIndex]
      if (!question) throw new Error('テスト問題が見つかりません')
      session = nextDakutenQuestion(selectDakutenChoice(session, question.correctChoiceId))
    }
    const lastQuestion = session.questions[session.currentIndex]
    if (!lastQuestion) throw new Error('最後のテスト問題が見つかりません')

    render(
      <MemoryRouter initialEntries={['/dakuten']}>
        <DakutenSessionProvider initialSession={session}>
          <Routes>
            <Route path="/dakuten" element={<DakutenPage />} />
            <Route path="/dakuten/result" element={<p>結果ページ</p>} />
          </Routes>
        </DakutenSessionProvider>
      </MemoryRouter>,
    )

    await user.click(screen.getByRole('button', { name: lastQuestion.answer }))
    await user.click(screen.getByRole('button', { name: 'けっかを みる' }))
    expect(screen.getByText('結果ページ')).toBeInTheDocument()
  })
})
