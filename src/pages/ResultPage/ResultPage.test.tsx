import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi, beforeEach } from 'vitest'
import { appendHistory } from '../../features/history/model/historyStorage'
import { createQuizSession, recordAnswer } from '../../features/quiz/model/quizSession'
import type { KanaToPictureQuestion } from '../../features/question-types/kana-to-picture/model/types'
import { QuizSessionProvider } from '../../features/quiz/QuizSessionProvider'
import { ResultPage } from './ResultPage'

vi.mock('../../features/history/model/historyStorage', async () => {
  const actual = await vi.importActual<typeof import('../../features/history/model/historyStorage')>('../../features/history/model/historyStorage')
  return { ...actual, appendHistory: vi.fn(actual.appendHistory) }
})

const makeFiveQuestions = (): KanaToPictureQuestion[] =>
  Array.from({ length: 5 }, (_, index) => ({
    type: 'kana-to-picture' as const,
    id: `question-${index}`,
    kana: ['あ', 'い', 'う', 'え', 'お'][index],
    reading: 'テスト',
    choices: [
      { id: 'apple', label: 'りんご', imageSrc: '/images/apple.svg' },
      { id: 'ant', label: 'あり', imageSrc: '/images/ant.svg' },
      { id: 'umbrella', label: 'かさ', imageSrc: '/images/umbrella.svg' },
    ],
    correctChoiceId: 'apple',
  }))

function completedSession() {
  let session = createQuizSession(makeFiveQuestions(), () => new Date('2026-07-30T10:00:00.000Z'), () => 0)
  for (let index = 0; index < 5; index += 1) {
    session = recordAnswer(session, index === 0 ? 'ant' : 'apple')
  }
  return session
}

function ToggleResult({ visible }: { visible: boolean }) {
  return visible ? <ResultPage /> : null
}

describe('ResultPage', () => {
  beforeEach(() => vi.clearAllMocks())

  it('shows the score, all answer states, and saves history once', () => {
    render(
      <MemoryRouter>
        <QuizSessionProvider initialSession={completedSession()}>
          <ResultPage />
        </QuizSessionProvider>
      </MemoryRouter>,
    )

    expect(screen.getByText('4 / 5')).toBeInTheDocument()
    expect(screen.getAllByText('正解').length).toBe(4)
    expect(screen.getByText('不正解')).toBeInTheDocument()
    expect(appendHistory).toHaveBeenCalledTimes(1)
  })

  it('shows a recoverable message without a completed session', () => {
    render(
      <MemoryRouter>
        <QuizSessionProvider>
          <ResultPage />
        </QuizSessionProvider>
      </MemoryRouter>,
    )

    expect(screen.getByText('結果を表示できません')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'ホームへ戻る' })).toBeInTheDocument()
  })

  it('saves a completed result only once when the result page remounts', () => {
    const view = render(
      <MemoryRouter>
        <QuizSessionProvider initialSession={completedSession()}>
          <ToggleResult visible />
        </QuizSessionProvider>
      </MemoryRouter>,
    )

    view.rerender(
      <MemoryRouter>
        <QuizSessionProvider initialSession={completedSession()}>
          <ToggleResult visible={false} />
        </QuizSessionProvider>
      </MemoryRouter>,
    )
    view.rerender(
      <MemoryRouter>
        <QuizSessionProvider initialSession={completedSession()}>
          <ToggleResult visible />
        </QuizSessionProvider>
      </MemoryRouter>,
    )

    expect(appendHistory).toHaveBeenCalledTimes(1)
  })
})
