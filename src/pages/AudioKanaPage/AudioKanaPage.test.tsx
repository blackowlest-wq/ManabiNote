import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { AudioKanaSessionProvider } from '../../features/audio-kana/AudioKanaSessionProvider'
import { createAudioKanaQuestions } from '../../features/audio-kana/model/audioKanaQuestion'
import { createAudioKanaSession, nextAudioKanaQuestion, selectAudioKanaChoice } from '../../features/audio-kana/model/audioKanaSession'
import { AudioKanaPage } from './AudioKanaPage'

const questions = createAudioKanaQuestions(() => 0.999)
const initialSession = createAudioKanaSession(questions, () => new Date('2026-08-11T14:00:00.000Z'), () => 0.999)

const TestProvider = ({ children }: { children: React.ReactNode }) => (
  <AudioKanaSessionProvider initialSession={initialSession}>{children}</AudioKanaSessionProvider>
)

describe('AudioKanaPage', () => {
  it('shows progress, a play button, and kana choices', () => {
    render(<AudioKanaPage />, {
      wrapper: ({ children }) => <MemoryRouter><TestProvider>{children}</TestProvider></MemoryRouter>,
    })

    expect(screen.getByText('1 / 5')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'おとを きく' })).toBeInTheDocument()
    expect(screen.getByRole('group', { name: 'かなをえらぶ' })).toBeInTheDocument()
  })

  it('advances after the correct kana is selected', async () => {
    const user = userEvent.setup()
    const question = initialSession.questions[0]
    if (!question) throw new Error('テスト問題が見つかりません')
    const correctChoice = question.choices.find((choice) => choice.id === question.correctChoiceId)
    if (!correctChoice) throw new Error('正解の選択肢が見つかりません')

    render(<AudioKanaPage />, {
      wrapper: ({ children }) => <MemoryRouter><TestProvider>{children}</TestProvider></MemoryRouter>,
    })

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
      session = nextAudioKanaQuestion(selectAudioKanaChoice(session, question.correctChoiceId))
    }
    const lastQuestion = session.questions[session.currentIndex]
    if (!lastQuestion) throw new Error('最後のテスト問題が見つかりません')
    const correctChoice = lastQuestion.choices.find((choice) => choice.id === lastQuestion.correctChoiceId)
    if (!correctChoice) throw new Error('最後の正解が見つかりません')

    render(
      <MemoryRouter initialEntries={['/audio-kana']}>
        <AudioKanaSessionProvider initialSession={session}>
          <Routes>
            <Route path="/audio-kana" element={<AudioKanaPage />} />
            <Route path="/audio-kana/result" element={<p>結果ページ</p>} />
          </Routes>
        </AudioKanaSessionProvider>
      </MemoryRouter>,
    )

    await user.click(screen.getByRole('button', { name: correctChoice.character }))
    await user.click(screen.getByRole('button', { name: 'けっかを みる' }))
    expect(screen.getByText('結果ページ')).toBeInTheDocument()
  })
})
