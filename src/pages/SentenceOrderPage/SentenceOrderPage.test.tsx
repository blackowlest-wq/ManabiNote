import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { SentenceOrderSessionProvider } from '../../features/sentence-order/SentenceOrderSessionProvider'
import { createSentenceOrderQuestions } from '../../features/sentence-order/model/sentenceOrderQuestion'
import { createSentenceOrderSession } from '../../features/sentence-order/model/sentenceOrderSession'
import { SentenceOrderPage } from './SentenceOrderPage'

const initialSession = createSentenceOrderSession(
  'normal',
  createSentenceOrderQuestions('normal', () => 0.999),
  () => new Date('2026-08-11T10:00:00.000Z'),
  () => 0.999,
)

const renderPage = (session: typeof initialSession | null = initialSession) => render(
  <MemoryRouter initialEntries={['/sentence-order']}>
    <SentenceOrderSessionProvider initialSession={session ?? undefined}>
      <Routes>
        <Route path="/sentence-order" element={<SentenceOrderPage />} />
        <Route path="/sentence-order/result" element={<p>けっかページ</p>} />
      </Routes>
    </SentenceOrderSessionProvider>
  </MemoryRouter>,
)

describe('SentenceOrderPage', () => {
  it('starts after selecting a difficulty', async () => {
    const user = userEvent.setup()
    renderPage(null)

    await user.click(screen.getByRole('button', { name: /むずかしい/ }))

    expect(screen.getByText('1 / 5')).toBeInTheDocument()
  })

  it('shows progress and the word ordering question', () => {
    renderPage()

    expect(screen.getByText('1 / 5')).toBeInTheDocument()
    expect(screen.getByRole('group', { name: 'ことばをえらぶ' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'こたえあわせ' })).toBeDisabled()
  })

  it('advances after the sentence is completed correctly', async () => {
    const user = userEvent.setup()
    const question = initialSession.questions[0]
    if (!question) throw new Error('問題がありません')
    renderPage()

    for (const choiceId of question.correctChoiceIds) {
      const choice = question.choices.find((candidate) => candidate.id === choiceId)
      if (!choice) throw new Error('選択肢がありません')
      await user.click(screen.getByRole('button', { name: choice.word }))
    }
    await user.click(screen.getByRole('button', { name: 'こたえあわせ' }))
    expect(screen.getByText('せいかい！')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'つぎへ' }))

    expect(screen.getByText('2 / 5')).toBeInTheDocument()
  })
})
