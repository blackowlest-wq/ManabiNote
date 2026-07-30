import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { createQuizSession, type QuizSession } from './model/quizSession'
import type { KanaToPictureQuestion } from '../question-types/kana-to-picture/model/types'
import { QuizSessionProvider, useQuizSession } from './QuizSessionProvider'

vi.mock('../question-types/kana-to-picture/model/loader', () => ({
  loadKanaToPictureQuestions: () => {
    throw new Error('broken question data')
  },
}))

const question: KanaToPictureQuestion = {
  type: 'kana-to-picture',
  id: 'q-0',
  kana: 'あ',
  reading: 'テスト',
  choices: [
    { id: 'apple', label: 'りんご', reading: 'りんご', imageSrc: '/images/apple.svg' },
    { id: 'ant', label: 'あり', reading: 'あり', imageSrc: '/images/ant.svg' },
    { id: 'umbrella', label: 'かさ', reading: 'かさ', imageSrc: '/images/umbrella.svg' },
  ],
  correctChoiceId: 'apple',
}

const initialSession = createQuizSession(
  Array.from({ length: 5 }, (_, index) => ({ ...question, id: `q-${index}` })),
  () => new Date('2026-07-30T10:00:00.000Z'),
  () => 0.999,
)

function Probe() {
  const { session, error, startSession } = useQuizSession()
  return (
    <>
      <output data-testid="session-state">{session ? 'present' : 'empty'}</output>
      <button type="button" onClick={() => startSession()}>開始</button>
      {error && <p>{error.message}</p>}
    </>
  )
}

describe('QuizSessionProvider', () => {
  it('clears an old session and exposes an error when starting fails', async () => {
    const user = userEvent.setup()
    render(
      <QuizSessionProvider initialSession={initialSession as QuizSession}>
        <Probe />
      </QuizSessionProvider>,
    )

    await user.click(screen.getByRole('button', { name: '開始' }))

    expect(screen.getByTestId('session-state')).toHaveTextContent('empty')
    expect(screen.getByText('broken question data')).toBeInTheDocument()
  })
})
