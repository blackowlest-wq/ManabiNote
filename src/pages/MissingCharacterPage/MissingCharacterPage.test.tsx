import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { MissingCharacterSessionProvider } from '../../features/missing-character/MissingCharacterSessionProvider'
import { createMissingCharacterSession, nextMissingCharacterQuestion, selectChoice } from '../../features/missing-character/model/missingCharacterSession'
import type { MissingCharacterQuestion } from '../../features/missing-character/model/types'
import { MissingCharacterPage } from './MissingCharacterPage'

const makeQuestions = (): MissingCharacterQuestion[] => ['りんご', 'ねこ', 'いぬ', 'うし', 'くま'].map((reading, index) => ({
  id: `word-${index}`,
  reading,
  image: { atlasId: 'food-01', symbolId: 'apple' },
  missingIndex: 0,
  correctCharacter: Array.from(reading)[0] ?? 'あ',
  choices: [
    { id: `word-${index}-correct`, character: Array.from(reading)[0] ?? 'あ' },
    { id: `word-${index}-wrong-1`, character: 'い' },
    { id: `word-${index}-wrong-2`, character: 'う' },
    { id: `word-${index}-wrong-3`, character: 'え' },
  ],
  correctChoiceId: `word-${index}-correct`,
}))

const initialSession = createMissingCharacterSession(
  makeQuestions(),
  () => new Date('2026-08-11T10:00:00.000Z'),
  () => 0.999,
)

const TestProvider = ({ children }: { children: React.ReactNode }) => (
  <MissingCharacterSessionProvider initialSession={initialSession}>{children}</MissingCharacterSessionProvider>
)

describe('MissingCharacterPage', () => {
  it('shows progress, picture, masked word, and choices', () => {
    render(<MissingCharacterPage />, {
      wrapper: ({ children }) => <MemoryRouter><TestProvider>{children}</TestProvider></MemoryRouter>,
    })

    expect(screen.getByText('1 / 5')).toBeInTheDocument()
    expect(screen.getByRole('img', { name: 'りんご' })).toBeInTheDocument()
    expect(screen.getByRole('group', { name: '足りない文字をえらぶ' })).toBeInTheDocument()
  })

  it('shows retry feedback for an incorrect choice and advances after a correct choice', async () => {
    const user = userEvent.setup()
    render(<MissingCharacterPage />, {
      wrapper: ({ children }) => <MemoryRouter><TestProvider>{children}</TestProvider></MemoryRouter>,
    })

    await user.click(screen.getByRole('button', { name: 'い' }))
    expect(screen.getByText('もういちど えらんでね')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'り' }))
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
      session = nextMissingCharacterQuestion(selectChoice(session, question.correctChoiceId))
    }
    const lastQuestion = session.questions[session.currentIndex]
    if (!lastQuestion) throw new Error('最後のテスト問題が見つかりません')

    render(
      <MemoryRouter initialEntries={['/missing-character']}>
        <MissingCharacterSessionProvider initialSession={session}>
          <Routes>
            <Route path="/missing-character" element={<MissingCharacterPage />} />
            <Route path="/missing-character/result" element={<p>結果ページ</p>} />
          </Routes>
        </MissingCharacterSessionProvider>
      </MemoryRouter>,
    )

    expect(screen.getByText('5 / 5')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: lastQuestion.correctCharacter }))
    await user.click(screen.getByRole('button', { name: 'けっかを みる' }))
    expect(screen.getByText('結果ページ')).toBeInTheDocument()
  })
})
