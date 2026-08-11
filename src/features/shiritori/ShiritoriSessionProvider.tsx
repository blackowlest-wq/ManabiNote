import { createContext, useContext, useMemo, useState, type ReactNode } from 'react'
import { loadKanaToPictureQuestions } from '../question-types/kana-to-picture/model/loader'
import { createShiritoriQuestions } from './model/shiritoriQuestion'
import { createShiritoriSession, nextShiritoriQuestion, selectShiritoriChoice, type ShiritoriSession } from './model/shiritoriSession'

type ShiritoriSessionContextValue = {
  session: ShiritoriSession | null
  error: Error | null
  startSession: () => boolean
  selectChoice: (choiceId: string) => void
  nextQuestion: () => void
}

const ShiritoriSessionContext = createContext<ShiritoriSessionContextValue | null>(null)

export type ShiritoriSessionProviderProps = {
  children: ReactNode
  initialSession?: ShiritoriSession
}

export function ShiritoriSessionProvider({ children, initialSession }: ShiritoriSessionProviderProps) {
  const [session, setSession] = useState<ShiritoriSession | null>(initialSession ?? null)
  const [error, setError] = useState<Error | null>(null)

  const startSession = () => {
    try {
      const questions = createShiritoriQuestions(loadKanaToPictureQuestions())
      setSession(createShiritoriSession(questions))
      setError(null)
      return true
    } catch (cause) {
      setSession(null)
      setError(cause instanceof Error ? cause : new Error('しりとりを開始できませんでした'))
      return false
    }
  }

  const updateSession = (operation: (current: ShiritoriSession) => ShiritoriSession) => {
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

  const selectChoice = (choiceId: string) => updateSession((current) => selectShiritoriChoice(current, choiceId))
  const nextQuestion = () => updateSession(nextShiritoriQuestion)

  const value = useMemo<ShiritoriSessionContextValue>(
    () => ({ session, error, startSession, selectChoice, nextQuestion }),
    [session, error],
  )

  return <ShiritoriSessionContext.Provider value={value}>{children}</ShiritoriSessionContext.Provider>
}

export function useShiritoriSession() {
  const context = useContext(ShiritoriSessionContext)
  if (!context) throw new Error('ShiritoriSessionProviderの内側で使用してください')
  return context
}
