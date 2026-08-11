import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { SmallKanaSessionProvider } from '../../features/small-kana/SmallKanaSessionProvider'
import { createSmallKanaQuestions } from '../../features/small-kana/model/smallKanaQuestion'
import { createSmallKanaSession, nextSmallKanaQuestion, selectSmallKanaChoice } from '../../features/small-kana/model/smallKanaSession'
import { SmallKanaPage } from './SmallKanaPage'

const questions = createSmallKanaQuestions(() => 0.999)
const initialSession = createSmallKanaSession(questions, () => new Date('2026-08-11T14:00:00.000Z'), () => 0.999)

const renderPage = (session = initialSession) => render(
  <MemoryRouter initialEntries={['/small-kana']}>
    <SmallKanaSessionProvider initialSession={session}>
      <Routes>
        <Route path="/small-kana" element={<SmallKanaPage />} />
        <Route path="/small-kana/result" element={<p>けっかページ</p>} />
      </Routes>
    </SmallKanaSessionProvider>
  </MemoryRouter>,
)

describe('SmallKanaPage', () => {
  it('shows progress, a masked word, and choices', () => {
    renderPage()

    expect(screen.getByText('1 / 5')).toBeInTheDocument()
    expect(screen.getByRole('group', { name: 'ちいさいかなをえらぶ' })).toBeInTheDocument()
    expect(screen.getByLabelText(/問題のことば/)).toBeInTheDocument()
  })

  it('advances after the correct kana is selected', async () => {
    const user = userEvent.setup()
    const question = initialSession.questions[0]
    if (!question) throw new Error('テスト問題が見つかりません')
    const correctChoice = question.choices.find((choice) => choice.id === question.correctChoiceId)
    if (!correctChoice) throw new Error('正解の選択肢が見つかりません')

    renderPage()

    await user.click(screen.getByRole('button', { name: correctChoice.character }))
    await user.click(screen.getByRole('button', { name: 'つぎへ' }))

    expect(screen.getByText('2 / 5')).toBeInTheDocument()
  })

  it('navigates to the result page after the fifth answer', async () => {
    const user = userEvent.setup()
    let session = initialSession
    for (let index = 0; index < 4; index += 1) {
      const question = session.questions[session.currentIndex]
      if (!question) throw new Error('テスト問題が見つかりません')
      session = nextSmallKanaQuestion(selectSmallKanaChoice(session, question.correctChoiceId))
    }
    const lastQuestion = session.questions[session.currentIndex]
    if (!lastQuestion) throw new Error('最後の問題が見つかりません')
    const correctChoice = lastQuestion.choices.find((choice) => choice.id === lastQuestion.correctChoiceId)
    if (!correctChoice) throw new Error('最後の正解が見つかりません')

    renderPage(session)

    await user.click(screen.getByRole('button', { name: correctChoice.character }))
    await user.click(screen.getByRole('button', { name: 'けっかを みる' }))

    expect(screen.getByText('けっかページ')).toBeInTheDocument()
  })
})
