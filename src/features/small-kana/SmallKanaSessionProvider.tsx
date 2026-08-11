import { createContext, useContext, useMemo, useState, type ReactNode } from 'react'
import { createSmallKanaQuestions } from './model/smallKanaQuestion'
import { createSmallKanaSession, nextSmallKanaQuestion, selectSmallKanaChoice, type SmallKanaSession } from './model/smallKanaSession'

type SmallKanaSessionContextValue = {
  session: SmallKanaSession | null
  error: Error | null
  startSession: () => boolean
  selectChoice: (choiceId: string) => void
  nextQuestion: () => void
}

const SmallKanaSessionContext = createContext<SmallKanaSessionContextValue | null>(null)

export type SmallKanaSessionProviderProps = {
  children: ReactNode
  initialSession?: SmallKanaSession
}

export function SmallKanaSessionProvider({ children, initialSession }: SmallKanaSessionProviderProps) {
  const [session, setSession] = useState<SmallKanaSession | null>(initialSession ?? null)
  const [error, setError] = useState<Error | null>(null)

  const startSession = () => {
    try {
      setSession(createSmallKanaSession(createSmallKanaQuestions()))
      setError(null)
      return true
    } catch (cause) {
      setSession(null)
      setError(cause instanceof Error ? cause : new Error('ちいさいかなゲームを開始できませんでした'))
      return false
    }
  }

  const updateSession = (operation: (current: SmallKanaSession) => SmallKanaSession) => {
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

  const selectChoice = (choiceId: string) => updateSession((current) => selectSmallKanaChoice(current, choiceId))
  const nextQuestion = () => updateSession(nextSmallKanaQuestion)

  const value = useMemo<SmallKanaSessionContextValue>(
    () => ({ session, error, startSession, selectChoice, nextQuestion }),
    [session, error],
  )

  return <SmallKanaSessionContext.Provider value={value}>{children}</SmallKanaSessionContext.Provider>
}

export function useSmallKanaSession() {
  const context = useContext(SmallKanaSessionContext)
  if (!context) throw new Error('SmallKanaSessionProviderの内側で使用してください')
  return context
}
