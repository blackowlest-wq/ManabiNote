import { createContext, useContext, useMemo, useState, type ReactNode } from 'react'
import { loadKanaToPictureQuestions } from '../question-types/kana-to-picture/model/loader'
import { createMemorySession, flipMemoryCard, type MemorySession } from './model/memorySession'

type MemorySessionContextValue = {
  session: MemorySession | null
  error: Error | null
  startSession: () => boolean
  flipCard: (cardId: string) => void
}

const MemorySessionContext = createContext<MemorySessionContextValue | null>(null)

export type MemorySessionProviderProps = {
  children: ReactNode
  initialSession?: MemorySession
}

export function MemorySessionProvider({ children, initialSession }: MemorySessionProviderProps) {
  const [session, setSession] = useState<MemorySession | null>(initialSession ?? null)
  const [error, setError] = useState<Error | null>(null)

  const startSession = () => {
    try {
      setSession(createMemorySession(loadKanaToPictureQuestions()))
      setError(null)
      return true
    } catch (cause) {
      setSession(null)
      setError(cause instanceof Error ? cause : new Error('神経衰弱を開始できませんでした'))
      return false
    }
  }

  const flipCard = (cardId: string) => {
    setSession((current) => {
      if (!current) return current
      try {
        setError(null)
        return flipMemoryCard(current, cardId)
      } catch (cause) {
        setError(cause instanceof Error ? cause : new Error('カードを選べませんでした'))
        return current
      }
    })
  }

  const value = useMemo<MemorySessionContextValue>(
    () => ({ session, error, startSession, flipCard }),
    [session, error],
  )

  return <MemorySessionContext.Provider value={value}>{children}</MemorySessionContext.Provider>
}

export function useMemorySession() {
  const context = useContext(MemorySessionContext)
  if (!context) throw new Error('MemorySessionProviderの内側で使用してください')
  return context
}
