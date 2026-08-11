import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { SentenceOrderSessionProvider } from '../../features/sentence-order/SentenceOrderSessionProvider'
import { createSentenceOrderQuestions } from '../../features/sentence-order/model/sentenceOrderQuestion'
import {
  createSentenceOrderSession,
  nextSentenceOrderQuestion,
  selectSentenceOrderChoice,
  submitSentenceOrder,
} from '../../features/sentence-order/model/sentenceOrderSession'
import { SentenceOrderResultPage } from './SentenceOrderResultPage'

const makeCompleteSession = () => {
  let session = createSentenceOrderSession(
    'normal',
    createSentenceOrderQuestions('normal', () => 0.999),
    () => new Date('2026-08-11T10:00:00.000Z'),
    () => 0.999,
  )
  for (let index = 0; index < session.questions.length; index += 1) {
    const question = session.questions[session.currentIndex]
    if (!question) throw new Error('問題がありません')
    session = nextSentenceOrderQuestion(submitSentenceOrder(question.correctChoiceIds.reduce(selectSentenceOrderChoice, session)))
  }
  return session
}

const renderPage = () => render(
  <MemoryRouter initialEntries={['/sentence-order/result']}>
    <SentenceOrderSessionProvider initialSession={makeCompleteSession()}>
      <Routes>
        <Route path="/sentence-order/result" element={<SentenceOrderResultPage />} />
        <Route path="/sentence-order" element={<p>ゲームページ</p>} />
      </Routes>
    </SentenceOrderSessionProvider>
  </MemoryRouter>,
)

describe('SentenceOrderResultPage', () => {
  it('shows the completed result and retry action', () => {
    renderPage()

    expect(screen.getByRole('heading', { name: 'ぶんの れんしゅう おわり！' })).toBeInTheDocument()
    expect(screen.getByText('むずかしさ：ふつう')).toBeInTheDocument()
    expect(screen.getByText('5もん できたね！')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'もういちど' })).toBeInTheDocument()
  })

  it('starts a new session when retry is selected', async () => {
    const user = userEvent.setup()
    renderPage()

    await user.click(screen.getByRole('button', { name: 'もういちど' }))

    expect(screen.getByText('ゲームページ')).toBeInTheDocument()
  })
})
