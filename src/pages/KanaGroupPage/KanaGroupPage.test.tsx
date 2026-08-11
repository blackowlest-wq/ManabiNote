import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { KanaGroupSessionProvider } from '../../features/kana-group/KanaGroupSessionProvider'
import { createKanaGroupQuestions } from '../../features/kana-group/model/kanaGroupQuestion'
import { createKanaGroupSession, nextKanaGroupQuestion, selectKanaGroupChoice } from '../../features/kana-group/model/kanaGroupSession'
import { KanaGroupPage } from './KanaGroupPage'

const questions = createKanaGroupQuestions(() => 0.999)
const initialSession = createKanaGroupSession(questions, () => new Date('2026-08-11T13:00:00.000Z'), () => 0.999)

const TestProvider = ({ children }: { children: React.ReactNode }) => (
  <KanaGroupSessionProvider initialSession={initialSession}>{children}</KanaGroupSessionProvider>
)

describe('KanaGroupPage', () => {
  it('shows progress, target character, and group choices', () => {
    render(<KanaGroupPage />, {
      wrapper: ({ children }) => <MemoryRouter><TestProvider>{children}</TestProvider></MemoryRouter>,
    })

    expect(screen.getByText('1 / 5')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'あ' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'あいうえおのなかま' })).toBeInTheDocument()
  })

  it('allows retry and advances after the correct group is selected', async () => {
    const user = userEvent.setup()
    const question = initialSession.questions[0]
    if (!question) throw new Error('テスト問題が見つかりません')
    const correctChoice = question.choices.find((choice) => choice.id === question.correctChoiceId)
    const wrongChoice = question.choices.find((choice) => choice.id !== question.correctChoiceId)
    if (!correctChoice || !wrongChoice) throw new Error('テスト選択肢が見つかりません')

    render(<KanaGroupPage />, {
      wrapper: ({ children }) => <MemoryRouter><TestProvider>{children}</TestProvider></MemoryRouter>,
    })

    await user.click(screen.getByRole('button', { name: `${wrongChoice.label}のなかま` }))
    expect(screen.getByText('もういちど えらんでね')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: `${correctChoice.label}のなかま` }))
    await user.click(screen.getByRole('button', { name: 'つぎへ' }))
    expect(screen.getByText('2 / 5')).toBeInTheDocument()
  })

  it('navigates to the result page after the fifth answer', async () => {
    const user = userEvent.setup()
    let session = initialSession
    for (let index = 0; index < 4; index += 1) {
      const question = session.questions[session.currentIndex]
      if (!question) throw new Error('テスト問題が見つかりません')
      session = nextKanaGroupQuestion(selectKanaGroupChoice(session, question.correctChoiceId))
    }
    const lastQuestion = session.questions[session.currentIndex]
    if (!lastQuestion) throw new Error('最後のテスト問題が見つかりません')
    const lastCorrectChoice = lastQuestion.choices.find((choice) => choice.id === lastQuestion.correctChoiceId)
    if (!lastCorrectChoice) throw new Error('最後の正解が見つかりません')

    render(
      <MemoryRouter initialEntries={['/kana-group']}>
        <KanaGroupSessionProvider initialSession={session}>
          <Routes>
            <Route path="/kana-group" element={<KanaGroupPage />} />
            <Route path="/kana-group/result" element={<p>結果ページ</p>} />
          </Routes>
        </KanaGroupSessionProvider>
      </MemoryRouter>,
    )

    await user.click(screen.getByRole('button', { name: `${lastCorrectChoice.label}のなかま` }))
    await user.click(screen.getByRole('button', { name: 'けっかを みる' }))
    expect(screen.getByText('結果ページ')).toBeInTheDocument()
  })
})
