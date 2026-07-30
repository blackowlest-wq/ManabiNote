import { createContext, useContext, useMemo, useState, type ReactNode } from 'react'
import { loadKanaToPictureQuestions } from '../question-types/kana-to-picture/model/loader'
import type { KanaToPictureQuestion } from '../question-types/kana-to-picture/model/types'
import { createQuizSession, isSessionComplete, recordAnswer, type QuizAnswer, type QuizSession } from './model/quizSession'

type QuizSessionContextValue = {
  session: QuizSession | null
  result: QuizSession | null
  lastAnswer: QuizAnswer | null
  savedResultId: string | null
  error: Error | null
  startSession: () => boolean
  answer: (choiceId: string) => void
  nextQuestion: () => void
  markResultSaved: (resultId: string) => void
}

const QuizSessionContext = createContext<QuizSessionContextValue | null>(null)

export type QuizSessionProviderProps = {
  children: ReactNode
  initialSession?: QuizSession
}

export function QuizSessionProvider({ children, initialSession }: QuizSessionProviderProps) {
  const [session, setSession] = useState<QuizSession | null>(initialSession ?? null)
  const [result, setResult] = useState<QuizSession | null>(initialSession && isSessionComplete(initialSession) ? initialSession : null)
  const [lastAnswer, setLastAnswer] = useState<QuizAnswer | null>(null)
  const [savedResultId, setSavedResultId] = useState<string | null>(null)
  const [error, setError] = useState<Error | null>(null)

  const startSession = () => {
    try {
      const questions: KanaToPictureQuestion[] = loadKanaToPictureQuestions()
      const nextSession = createQuizSession(questions)
      setSession(nextSession)
      setResult(null)
      setLastAnswer(null)
      setSavedResultId(null)
      setError(null)
      return true
    } catch (cause) {
      setSession(null)
      setResult(null)
      setLastAnswer(null)
      setError(cause instanceof Error ? cause : new Error('問題を開始できませんでした'))
      return false
    }
  }

  const answer = (choiceId: string) => {
    if (!session || lastAnswer) return
    try {
      const nextSession = recordAnswer(session, choiceId)
      setSession(nextSession)
      setLastAnswer(nextSession.answers.at(-1) ?? null)
      if (isSessionComplete(nextSession)) setResult(nextSession)
    } catch (cause) {
      setError(cause instanceof Error ? cause : new Error('回答を記録できませんでした'))
    }
  }

  const nextQuestion = () => setLastAnswer(null)
  const markResultSaved = (resultId: string) => setSavedResultId(resultId)

  const value = useMemo<QuizSessionContextValue>(
    () => ({ session, result, lastAnswer, savedResultId, error, startSession, answer, nextQuestion, markResultSaved }),
    [session, result, lastAnswer, savedResultId, error],
  )

  return <QuizSessionContext.Provider value={value}>{children}</QuizSessionContext.Provider>
}

export function useQuizSession() {
  const context = useContext(QuizSessionContext)
  if (!context) throw new Error('QuizSessionProviderの内側で使用してください')
  return context
}
