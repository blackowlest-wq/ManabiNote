import { createContext, useContext, useMemo, useState, type ReactNode } from 'react'
import { createNumberCompareQuestions } from './model/numberCompareQuestion'
import { createNumberCompareSession, nextNumberCompareQuestion, selectNumberCompareChoice, type NumberCompareSession } from './model/numberCompareSession'

type NumberCompareSessionContextValue = {
  session: NumberCompareSession | null
  error: Error | null
  startSession: () => boolean
  selectChoice: (choiceId: string) => void
  nextQuestion: () => void
}

const NumberCompareSessionContext = createContext<NumberCompareSessionContextValue | null>(null)

export type NumberCompareSessionProviderProps = {
  children: ReactNode
  initialSession?: NumberCompareSession
}

export function NumberCompareSessionProvider({ children, initialSession }: NumberCompareSessionProviderProps) {
  const [session, setSession] = useState<NumberCompareSession | null>(initialSession ?? null)
  const [error, setError] = useState<Error | null>(null)

  const startSession = () => {
    try {
      setSession(createNumberCompareSession(createNumberCompareQuestions()))
      setError(null)
      return true
    } catch (cause) {
      setSession(null)
      setError(cause instanceof Error ? cause : new Error('数の大小ゲームを開始できませんでした'))
      return false
    }
  }

  const updateSession = (operation: (current: NumberCompareSession) => NumberCompareSession) => {
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

  const selectChoice = (choiceId: string) => updateSession((current) => selectNumberCompareChoice(current, choiceId))
  const nextQuestion = () => updateSession(nextNumberCompareQuestion)

  const value = useMemo<NumberCompareSessionContextValue>(
    () => ({ session, error, startSession, selectChoice, nextQuestion }),
    [session, error],
  )

  return <NumberCompareSessionContext.Provider value={value}>{children}</NumberCompareSessionContext.Provider>
}

export function useNumberCompareSession() {
  const context = useContext(NumberCompareSessionContext)
  if (!context) throw new Error('NumberCompareSessionProviderの内側で使用してください')
  return context
}
