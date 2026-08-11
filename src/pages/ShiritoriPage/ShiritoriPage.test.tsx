import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { loadKanaToPictureQuestions } from '../../features/question-types/kana-to-picture/model/loader'
import { ShiritoriSessionProvider } from '../../features/shiritori/ShiritoriSessionProvider'
import { createShiritoriQuestions } from '../../features/shiritori/model/shiritoriQuestion'
import { createShiritoriSession, nextShiritoriQuestion, selectShiritoriChoice } from '../../features/shiritori/model/shiritoriSession'
import { ShiritoriPage } from './ShiritoriPage'

const initialSession = createShiritoriSession(
  createShiritoriQuestions(loadKanaToPictureQuestions(), () => 0.999),
  () => new Date('2026-08-11T14:00:00.000Z'),
  () => 0.999,
)

const renderPage = (session = initialSession) => render(
  <MemoryRouter initialEntries={['/shiritori']}>
    <ShiritoriSessionProvider initialSession={session}>
      <Routes>
        <Route path="/shiritori" element={<ShiritoriPage />} />
        <Route path="/shiritori/result" element={<p>けっかページ</p>} />
      </Routes>
    </ShiritoriSessionProvider>
  </MemoryRouter>,
)

describe('ShiritoriPage', () => {
  it('shows progress, the previous word, and picture choices', () => {
    renderPage()

    expect(screen.getByText('1 / 5')).toBeInTheDocument()
    expect(screen.getByRole('group', { name: 'つぎのことばをえらぶ' })).toBeInTheDocument()
    const previousWord = initialSession.questions[0]?.previousWord
    if (!previousWord) throw new Error('前のことばが見つかりません')
    expect(screen.getByRole('img', { name: `${previousWord}のえ` })).toBeInTheDocument()
  })

  it('advances after the correct word is selected', async () => {
    const user = userEvent.setup()
    const question = initialSession.questions[0]
    if (!question) throw new Error('テスト問題が見つかりません')
    const correctChoice = question.choices.find((choice) => choice.id === question.correctChoiceId)
    if (!correctChoice) throw new Error('正解の選択肢が見つかりません')

    renderPage()

    await user.click(screen.getByRole('button', { name: correctChoice.label }))
    await user.click(screen.getByRole('button', { name: 'つぎへ' }))

    expect(screen.getByText('2 / 5')).toBeInTheDocument()
  })

  it('navigates to the result page after the fifth answer', async () => {
    const user = userEvent.setup()
    let session = initialSession
    for (let index = 0; index < 4; index += 1) {
      const question = session.questions[session.currentIndex]
      if (!question) throw new Error('テスト問題が見つかりません')
      session = nextShiritoriQuestion(selectShiritoriChoice(session, question.correctChoiceId))
    }
    const lastQuestion = session.questions[session.currentIndex]
    if (!lastQuestion) throw new Error('最後の問題が見つかりません')
    const correctChoice = lastQuestion.choices.find((choice) => choice.id === lastQuestion.correctChoiceId)
    if (!correctChoice) throw new Error('最後の正解が見つかりません')

    renderPage(session)

    await user.click(screen.getByRole('button', { name: correctChoice.label }))
    await user.click(screen.getByRole('button', { name: 'けっかを みる' }))

    expect(screen.getByText('けっかページ')).toBeInTheDocument()
  })
})
