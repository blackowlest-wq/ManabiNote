import { createContext, useContext, useMemo, useState, type ReactNode } from 'react'
import { createArithmeticQuestions } from './model/arithmeticQuestion'
import { createArithmeticSession, nextArithmeticQuestion, selectArithmeticChoice, type ArithmeticSession } from './model/arithmeticSession'
import type { ArithmeticKind } from './model/types'
import type { GameDifficulty } from '../../shared/gameDifficulty'

type ArithmeticSessionContextValue = {
  session: ArithmeticSession | null
  error: Error | null
  startSession: (kind: ArithmeticKind, difficulty: GameDifficulty) => boolean
  selectChoice: (choiceId: string) => void
  nextQuestion: () => void
}

const ArithmeticSessionContext = createContext<ArithmeticSessionContextValue | null>(null)

export type ArithmeticSessionProviderProps = {
  children: ReactNode
  initialSession?: ArithmeticSession
}

export function ArithmeticSessionProvider({ children, initialSession }: ArithmeticSessionProviderProps) {
  const [session, setSession] = useState<ArithmeticSession | null>(initialSession ?? null)
  const [error, setError] = useState<Error | null>(null)

  const startSession = (kind: ArithmeticKind, difficulty: GameDifficulty) => {
    try {
      setSession(createArithmeticSession(kind, difficulty, createArithmeticQuestions(kind, difficulty)))
      setError(null)
      return true
    } catch (cause) {
      setSession(null)
      setError(cause instanceof Error ? cause : new Error('けいさんゲームを開始できませんでした'))
      return false
    }
  }

  const updateSession = (operation: (current: ArithmeticSession) => ArithmeticSession) => {
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

  const selectChoice = (choiceId: string) => updateSession((current) => selectArithmeticChoice(current, choiceId))
  const nextQuestion = () => updateSession(nextArithmeticQuestion)

  const value = useMemo<ArithmeticSessionContextValue>(
    () => ({ session, error, startSession, selectChoice, nextQuestion }),
    [session, error],
  )

  return <ArithmeticSessionContext.Provider value={value}>{children}</ArithmeticSessionContext.Provider>
}

export function useArithmeticSession() {
  const context = useContext(ArithmeticSessionContext)
  if (!context) throw new Error('ArithmeticSessionProviderの内側で使用してください')
  return context
}
