import { createContext, useContext, useMemo, useState, type ReactNode } from 'react'
import { createDakutenQuestions } from './model/dakutenQuestion'
import { createDakutenSession, nextDakutenQuestion, selectDakutenChoice, type DakutenSession } from './model/dakutenSession'

type DakutenSessionContextValue = {
  session: DakutenSession | null
  error: Error | null
  startSession: () => boolean
  selectChoice: (choiceId: string) => void
  nextQuestion: () => void
}

const DakutenSessionContext = createContext<DakutenSessionContextValue | null>(null)

export type DakutenSessionProviderProps = {
  children: ReactNode
  initialSession?: DakutenSession
}

export function DakutenSessionProvider({ children, initialSession }: DakutenSessionProviderProps) {
  const [session, setSession] = useState<DakutenSession | null>(initialSession ?? null)
  const [error, setError] = useState<Error | null>(null)

  const startSession = () => {
    try {
      setSession(createDakutenSession(createDakutenQuestions()))
      setError(null)
      return true
    } catch (cause) {
      setSession(null)
      setError(cause instanceof Error ? cause : new Error('てんてんとまるのゲームを開始できませんでした'))
      return false
    }
  }

  const updateSession = (operation: (current: DakutenSession) => DakutenSession) => {
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

  const selectChoice = (choiceId: string) => updateSession((current) => selectDakutenChoice(current, choiceId))
  const nextQuestion = () => updateSession(nextDakutenQuestion)

  const value = useMemo<DakutenSessionContextValue>(
    () => ({ session, error, startSession, selectChoice, nextQuestion }),
    [session, error],
  )

  return <DakutenSessionContext.Provider value={value}>{children}</DakutenSessionContext.Provider>
}

export function useDakutenSession() {
  const context = useContext(DakutenSessionContext)
  if (!context) throw new Error('DakutenSessionProviderの内側で使用してください')
  return context
}
