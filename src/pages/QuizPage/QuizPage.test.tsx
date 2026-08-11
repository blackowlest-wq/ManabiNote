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
    reading: 'テスト',
    choices: [
      { id: 'apple', label: 'りんご', reading: 'りんご', image: { atlasId: 'food-01', symbolId: 'apple' } },
      { id: 'ant', label: 'あり', reading: 'あり', image: { atlasId: 'animals-01', symbolId: 'ant' } },
      { id: 'umbrella', label: 'かさ', reading: 'かさ', image: { atlasId: 'objects-01', symbolId: 'umbrella' } },
    ],
    correctChoiceId: 'apple',
  }))

function TestQuizProvider({ children }: { children: React.ReactNode }) {
  const session = createQuizSession(makeFiveQuestions(), () => new Date('2026-07-30T10:00:00.000Z'), () => 0.999)
  return <QuizSessionProvider initialSession={session}>{children}</QuizSessionProvider>
}

describe('QuizPage', () => {
  it('starts a new quiz when opened from the words menu', async () => {
    render(<QuizPage />, {
      wrapper: ({ children }) => (
        <MemoryRouter>
          <QuizSessionProvider>{children}</QuizSessionProvider>
        </MemoryRouter>
      ),
    })

    expect(await screen.findByText(/1 \/ \d+/)).toBeInTheDocument()
  })

  it('shows picture labels when the hint button is pressed', async () => {
    const user = userEvent.setup()
    render(<QuizPage />, {
      wrapper: ({ children }) => (
        <MemoryRouter>
          <TestQuizProvider>{children}</TestQuizProvider>
        </MemoryRouter>
      ),
    })

    expect(screen.queryByText('りんご')).not.toBeInTheDocument()
    const answerButton = screen.getByRole('button', { name: '回答する' })
    const hintButton = screen.getByRole('button', { name: 'ヒント' })
    expect(answerButton.parentElement).toContainElement(hintButton)

    await user.click(hintButton)

    expect(screen.getByText('りんご')).toBeInTheDocument()
    expect(screen.getByText('あり')).toBeInTheDocument()
    expect(screen.getByText('かさ')).toBeInTheDocument()
    expect(screen.queryByText('正解！')).not.toBeInTheDocument()
  })

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

    expect(screen.queryByText('正解！')).not.toBeInTheDocument()
    expect(screen.queryByText('不正解。')).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: '回答する' })).toBeEnabled()
    expect(screen.getByRole('button', { name: 'りんご' })).toHaveAttribute('aria-pressed', 'true')

    await user.click(screen.getByRole('button', { name: 'あり' }))

    expect(screen.queryByText('不正解。')).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'りんご' })).toHaveAttribute('aria-pressed', 'false')
    expect(screen.getByRole('button', { name: 'あり' })).toHaveAttribute('aria-pressed', 'true')

    await user.click(screen.getByRole('button', { name: 'りんご' }))

    await user.click(screen.getByRole('button', { name: '回答する' }))

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
    await user.click(screen.getByRole('button', { name: '回答する' }))
    await user.click(screen.getByRole('button', { name: '次の問題' }))

    expect(screen.getByText('2 / 5')).toBeInTheDocument()
    expect(screen.getByText('い')).toBeInTheDocument()
  })
})
