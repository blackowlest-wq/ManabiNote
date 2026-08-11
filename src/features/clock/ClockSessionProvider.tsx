import { createContext, useContext, useMemo, useState, type ReactNode } from 'react'
import type { GameDifficulty } from '../../shared/gameDifficulty'
import { createClockQuestions } from './model/clockQuestion'
import { createClockSession, nextClockQuestion, selectClockChoice, type ClockSession } from './model/clockSession'

type ClockSessionContextValue = {
  session: ClockSession | null
  error: Error | null
  startSession: (difficulty: GameDifficulty) => boolean
  selectChoice: (choiceId: string) => void
  nextQuestion: () => void
}

const ClockSessionContext = createContext<ClockSessionContextValue | null>(null)

export function ClockSessionProvider({ children, initialSession }: { children: ReactNode; initialSession?: ClockSession }) {
  const [session, setSession] = useState<ClockSession | null>(initialSession ?? null)
  const [error, setError] = useState<Error | null>(null)

  const startSession = (difficulty: GameDifficulty) => {
    try {
      setSession(createClockSession(difficulty, createClockQuestions(difficulty)))
      setError(null)
      return true
    } catch (cause) {
      setSession(null)
      setError(cause instanceof Error ? cause : new Error('とけいゲームを開始できませんでした'))
      return false
    }
  }

  const updateSession = (operation: (current: ClockSession) => ClockSession) => {
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

  const selectChoice = (choiceId: string) => updateSession((current) => selectClockChoice(current, choiceId))
  const nextQuestion = () => updateSession(nextClockQuestion)
  const value = useMemo<ClockSessionContextValue>(
    () => ({ session, error, startSession, selectChoice, nextQuestion }),
    [session, error],
  )

  return <ClockSessionContext.Provider value={value}>{children}</ClockSessionContext.Provider>
}

export function useClockSession() {
  const context = useContext(ClockSessionContext)
  if (!context) throw new Error('ClockSessionProviderの内側で使用してください')
  return context
}
