import { createContext, useContext, useMemo, useState, type ReactNode } from 'react'
import { createNumberOrderQuestions } from './model/numberOrderQuestion'
import { createNumberOrderSession, nextNumberOrderQuestion, selectNumberOrderChoice, type NumberOrderSession } from './model/numberOrderSession'

type NumberOrderSessionContextValue = {
  session: NumberOrderSession | null
  error: Error | null
  startSession: () => boolean
  selectChoice: (choiceId: string) => void
  nextQuestion: () => void
}

const NumberOrderSessionContext = createContext<NumberOrderSessionContextValue | null>(null)

export type NumberOrderSessionProviderProps = {
  children: ReactNode
  initialSession?: NumberOrderSession
}

export function NumberOrderSessionProvider({ children, initialSession }: NumberOrderSessionProviderProps) {
  const [session, setSession] = useState<NumberOrderSession | null>(initialSession ?? null)
  const [error, setError] = useState<Error | null>(null)

  const startSession = () => {
    try {
      setSession(createNumberOrderSession(createNumberOrderQuestions()))
      setError(null)
      return true
    } catch (cause) {
      setSession(null)
      setError(cause instanceof Error ? cause : new Error('かずの じゅんばんゲームを開始できませんでした'))
      return false
    }
  }

  const updateSession = (operation: (current: NumberOrderSession) => NumberOrderSession) => {
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

  const selectChoice = (choiceId: string) => updateSession((current) => selectNumberOrderChoice(current, choiceId))
  const nextQuestion = () => updateSession(nextNumberOrderQuestion)

  const value = useMemo<NumberOrderSessionContextValue>(
    () => ({ session, error, startSession, selectChoice, nextQuestion }),
    [session, error],
  )

  return <NumberOrderSessionContext.Provider value={value}>{children}</NumberOrderSessionContext.Provider>
}

export function useNumberOrderSession() {
  const context = useContext(NumberOrderSessionContext)
  if (!context) throw new Error('NumberOrderSessionProviderの内側で使用してください')
  return context
}
