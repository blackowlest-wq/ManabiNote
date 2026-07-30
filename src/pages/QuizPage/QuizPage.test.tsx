import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { createQuizSession } from '../../features/quiz/model/quizSession'
import type { KanaToPictureQuestion } from '../../features/question-types/kana-to-picture/model/types'
import { QuizSessionProvider } from '../../features/quiz/QuizSessionProvider'
import { QuizPage } from './QuizPage'

const makeFiveQuestions = (): KanaToPictureQuestion[] =>
  Array.from({ length: 5 }, (_, index) => ({
    type: 'kana-to-picture' as const,
    id: `question-${index}`,
    kana: ['あ', 'い', 'う', 'え', 'お'][index],
    choices: [
      { id: 'apple', label: 'りんご', imageSrc: '/images/apple.svg' },
      { id: 'ant', label: 'あり', imageSrc: '/images/ant.svg' },
      { id: 'umbrella', label: 'かさ', imageSrc: '/images/umbrella.svg' },
    ],
    correctChoiceId: 'apple',
  }))

function TestQuizProvider({ children }: { children: React.ReactNode }) {
  const session = createQuizSession(makeFiveQuestions(), () => new Date('2026-07-30T10:00:00.000Z'), () => 0.999)
  return <QuizSessionProvider initialSession={session}>{children}</QuizSessionProvider>
}

describe('QuizPage', () => {
  it('locks choices and shows feedback after one answer', async () => {
    const user = userEvent.setup()
    render(<QuizPage />, {
      wrapper: ({ children }) => (
        <MemoryRouter>
          <TestQuizProvider>{children}</TestQuizProvider>
        </MemoryRouter>
      ),
    })

    await user.click(screen.getByRole('button', { name: 'りんご' }))

    expect(screen.getByText('正解！')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'りんご' })).toBeDisabled()
    expect(screen.getByRole('button', { name: '次の問題' })).toBeInTheDocument()
  })

  it('moves to the next question after clicking next', async () => {
    const user = userEvent.setup()
    render(<QuizPage />, {
      wrapper: ({ children }) => (
        <MemoryRouter>
          <TestQuizProvider>{children}</TestQuizProvider>
        </MemoryRouter>
      ),
    })

    await user.click(screen.getByRole('button', { name: 'りんご' }))
    await user.click(screen.getByRole('button', { name: '次の問題' }))

    expect(screen.getByText('2 / 5')).toBeInTheDocument()
    expect(screen.getByText('い')).toBeInTheDocument()
  })
})
