import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { AudioKanaSessionProvider } from '../../features/audio-kana/AudioKanaSessionProvider'
import { createAudioKanaQuestions } from '../../features/audio-kana/model/audioKanaQuestion'
import { createAudioKanaSession, nextAudioKanaQuestion, selectAudioKanaChoice } from '../../features/audio-kana/model/audioKanaSession'
import { AudioKanaResultPage } from './AudioKanaResultPage'

const createCompleteSession = () => {
  let session = createAudioKanaSession(createAudioKanaQuestions(() => 0.999), () => new Date('2026-08-11T14:00:00.000Z'), () => 0.999)
  for (let index = 0; index < 5; index += 1) {
    const question = session.questions[session.currentIndex]
    if (!question) throw new Error('テスト問題が見つかりません')
    session = nextAudioKanaQuestion(selectAudioKanaChoice(session, question.correctChoiceId))
  }
  return session
}

describe('AudioKanaResultPage', () => {
  it('shows a recoverable message without a completed session', () => {
    render(<AudioKanaResultPage />, {
      wrapper: ({ children }) => (
        <MemoryRouter>
          <AudioKanaSessionProvider>{children}</AudioKanaSessionProvider>
        </MemoryRouter>
      ),
    })

    expect(screen.getByText('結果を表示できません。')).toBeInTheDocument()
  })

  it('shows the completion message and actions', () => {
    render(<AudioKanaResultPage />, {
      wrapper: ({ children }) => (
        <MemoryRouter>
          <AudioKanaSessionProvider initialSession={createCompleteSession()}>{children}</AudioKanaSessionProvider>
        </MemoryRouter>
      ),
    })

    expect(screen.getByText('5もん できたね！')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'もういちど' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'ホームへ戻る' })).toBeInTheDocument()
  })
})
