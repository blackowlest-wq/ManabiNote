import { createContext, useContext, useMemo, useState, type ReactNode } from 'react'
import { loadKanaToPictureQuestions } from '../question-types/kana-to-picture/model/loader'
import { createCountingQuestions } from './model/countingQuestion'
import { createCountingSession, nextCountingQuestion, selectCountingChoice, type CountingSession } from './model/countingSession'

type CountingSessionContextValue = {
  session: CountingSession | null
  error: Error | null
  startSession: () => boolean
  selectChoice: (choiceId: string) => void
  nextQuestion: () => void
}

const CountingSessionContext = createContext<CountingSessionContextValue | null>(null)

export type CountingSessionProviderProps = {
  children: ReactNode
  initialSession?: CountingSession
}

export function CountingSessionProvider({ children, initialSession }: CountingSessionProviderProps) {
  const [session, setSession] = useState<CountingSession | null>(initialSession ?? null)
  const [error, setError] = useState<Error | null>(null)

  const startSession = () => {
    try {
      const questions = createCountingQuestions(loadKanaToPictureQuestions())
      setSession(createCountingSession(questions))
      setError(null)
      return true
    } catch (cause) {
      setSession(null)
      setError(cause instanceof Error ? cause : new Error('かずをかぞえるゲームを開始できませんでした'))
      return false
    }
  }

  const updateSession = (operation: (current: CountingSession) => CountingSession) => {
    setSession((current) => {
      if (!current) return current
      try {
        setError(null)
        return operation(current)
      } catch (cause) {
        setError(cause instanceof Error ? cause : new Error('ゲームの状態を更新できませんでした'))
        return current
      }
    })
  }

  const selectChoice = (choiceId: string) => updateSession((current) => selectCountingChoice(current, choiceId))
  const nextQuestion = () => updateSession(nextCountingQuestion)

  const value = useMemo<CountingSessionContextValue>(
    () => ({ session, error, startSession, selectChoice, nextQuestion }),
    [session, error],
  )

  return <CountingSessionContext.Provider value={value}>{children}</CountingSessionContext.Provider>
}

export function useCountingSession() {
  const context = useContext(CountingSessionContext)
  if (!context) throw new Error('CountingSessionProviderの内側で使用してください')
  return context
}
