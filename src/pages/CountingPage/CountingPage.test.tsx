import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { loadKanaToPictureQuestions } from '../../features/question-types/kana-to-picture/model/loader'
import { CountingSessionProvider } from '../../features/counting/CountingSessionProvider'
import { createCountingQuestions } from '../../features/counting/model/countingQuestion'
import { createCountingSession, nextCountingQuestion, selectCountingChoice } from '../../features/counting/model/countingSession'
import { CountingPage } from './CountingPage'

const initialSession = createCountingSession(
  createCountingQuestions(loadKanaToPictureQuestions(), () => 0.999),
  () => new Date('2026-08-11T14:00:00.000Z'),
  () => 0.999,
)

const renderPage = (session = initialSession) => render(
  <MemoryRouter initialEntries={['/counting']}>
    <CountingSessionProvider initialSession={session}>
      <Routes>
        <Route path="/counting" element={<CountingPage />} />
        <Route path="/counting/result" element={<p>けっかページ</p>} />
      </Routes>
    </CountingSessionProvider>
  </MemoryRouter>,
)

describe('CountingPage', () => {
  it('shows progress, repeated pictures, and number choices', () => {
    renderPage()

    const question = initialSession.questions[0]
    if (!question) throw new Error('テスト問題が見つかりません')
    expect(screen.getByText('1 / 5')).toBeInTheDocument()
    expect(screen.getByRole('group', { name: `かずをえらぶ` })).toBeInTheDocument()
    expect(screen.getAllByRole('img', { name: question.label })).toHaveLength(question.count)
  })

  it('advances after the correct number is selected', async () => {
    const user = userEvent.setup()
    const question = initialSession.questions[0]
    if (!question) throw new Error('テスト問題が見つかりません')
    const correctChoice = question.choices.find((choice) => choice.id === question.correctChoiceId)
    if (!correctChoice) throw new Error('正解の選択肢が見つかりません')

    renderPage()

    await user.click(screen.getByRole('button', { name: `${correctChoice.count}こ` }))
    await user.click(screen.getByRole('button', { name: 'つぎへ' }))

    expect(screen.getByText('2 / 5')).toBeInTheDocument()
  })

  it('navigates to the result page after the fifth answer', async () => {
    const user = userEvent.setup()
    let session = initialSession
    for (let index = 0; index < 4; index += 1) {
      const question = session.questions[session.currentIndex]
      if (!question) throw new Error('テスト問題が見つかりません')
      session = nextCountingQuestion(selectCountingChoice(session, question.correctChoiceId))
    }
    const lastQuestion = session.questions[session.currentIndex]
    if (!lastQuestion) throw new Error('最後の問題が見つかりません')
    const correctChoice = lastQuestion.choices.find((choice) => choice.id === lastQuestion.correctChoiceId)
    if (!correctChoice) throw new Error('最後の正解が見つかりません')

    renderPage(session)

    await user.click(screen.getByRole('button', { name: `${correctChoice.count}こ` }))
    await user.click(screen.getByRole('button', { name: 'けっかを みる' }))

    expect(screen.getByText('けっかページ')).toBeInTheDocument()
  })
})
