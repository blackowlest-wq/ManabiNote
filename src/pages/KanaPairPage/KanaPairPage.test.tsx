import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { KanaPairSessionProvider } from '../../features/kana-pair/KanaPairSessionProvider'
import { createKanaPairSession, nextKanaPairQuestion, selectKanaPairChoice } from '../../features/kana-pair/model/kanaPairSession'
import type { KanaPairQuestion } from '../../features/kana-pair/model/types'
import { KanaPairPage } from './KanaPairPage'

const makeQuestions = (): KanaPairQuestion[] => ['ね', 'あ', 'み', 'ほ', 'る'].map((hiragana, index) => ({
  id: `test-kana-pair-${index}`,
  hiragana,
  katakana: ({ ね: 'ネ', あ: 'ア', み: 'ミ', ほ: 'ホ', る: 'ル' } as Record<string, string>)[hiragana] ?? 'ア',
  choices: [
    { id: `test-${index}-correct`, character: ({ ね: 'ネ', あ: 'ア', み: 'ミ', ほ: 'ホ', る: 'ル' } as Record<string, string>)[hiragana] ?? 'ア' },
    { id: `test-${index}-wrong-1`, character: 'イ' },
    { id: `test-${index}-wrong-2`, character: 'ウ' },
    { id: `test-${index}-wrong-3`, character: 'エ' },
  ],
  correctChoiceId: `test-${index}-correct`,
}))

const initialSession = createKanaPairSession(
  makeQuestions(),
  () => new Date('2026-08-11T11:00:00.000Z'),
  () => 0.999,
)

const TestProvider = ({ children }: { children: React.ReactNode }) => (
  <KanaPairSessionProvider initialSession={initialSession}>{children}</KanaPairSessionProvider>
)

describe('KanaPairPage', () => {
  it('shows progress, hiragana, and katakana choices', () => {
    render(<KanaPairPage />, {
      wrapper: ({ children }) => <MemoryRouter><TestProvider>{children}</TestProvider></MemoryRouter>,
    })

    expect(screen.getByText('1 / 5')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'ね' })).toBeInTheDocument()
    expect(screen.getByRole('group', { name: 'カタカナをえらぶ' })).toBeInTheDocument()
  })

  it('allows retry and advances after the matching katakana is selected', async () => {
    const user = userEvent.setup()
    render(<KanaPairPage />, {
      wrapper: ({ children }) => <MemoryRouter><TestProvider>{children}</TestProvider></MemoryRouter>,
    })

    await user.click(screen.getByRole('button', { name: 'イ' }))
    expect(screen.getByText('もういちど えらんでね')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'ネ' }))
    expect(screen.getByText('せいかい！')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'つぎへ' }))
    expect(screen.getByText('2 / 5')).toBeInTheDocument()
  })

  it('navigates to the result page after the fifth answer', async () => {
    const user = userEvent.setup()
    let session = initialSession
    for (let index = 0; index < 4; index += 1) {
      const question = session.questions[session.currentIndex]
      if (!question) throw new Error('テスト問題が見つかりません')
      session = nextKanaPairQuestion(selectKanaPairChoice(session, question.correctChoiceId))
    }
    const lastQuestion = session.questions[session.currentIndex]
    if (!lastQuestion) throw new Error('最後のテスト問題が見つかりません')

    render(
      <MemoryRouter initialEntries={['/kana-pair']}>
        <KanaPairSessionProvider initialSession={session}>
          <Routes>
            <Route path="/kana-pair" element={<KanaPairPage />} />
            <Route path="/kana-pair/result" element={<p>結果ページ</p>} />
          </Routes>
        </KanaPairSessionProvider>
      </MemoryRouter>,
    )

    expect(screen.getByText('5 / 5')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: lastQuestion.katakana }))
    await user.click(screen.getByRole('button', { name: 'けっかを みる' }))
    expect(screen.getByText('結果ページ')).toBeInTheDocument()
  })
})
