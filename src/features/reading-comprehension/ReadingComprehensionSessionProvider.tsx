import { createContext, useContext, useMemo, useState, type ReactNode } from 'react'
import type { GameDifficulty } from '../../shared/gameDifficulty'
import { createReadingComprehensionQuestions } from './model/readingComprehensionQuestion'
import {
  createReadingComprehensionSession,
  nextReadingComprehensionQuestion,
  selectReadingComprehensionChoice,
  type ReadingComprehensionSession,
} from './model/readingComprehensionSession'

type ReadingComprehensionSessionContextValue = {
  session: ReadingComprehensionSession | null
  error: Error | null
  startSession: (difficulty: GameDifficulty) => boolean
  selectChoice: (choiceId: string) => void
  nextQuestion: () => void
}

const ReadingComprehensionSessionContext = createContext<ReadingComprehensionSessionContextValue | null>(null)

export type ReadingComprehensionSessionProviderProps = {
  children: ReactNode
  initialSession?: ReadingComprehensionSession
}

export function ReadingComprehensionSessionProvider({ children, initialSession }: ReadingComprehensionSessionProviderProps) {
  const [session, setSession] = useState<ReadingComprehensionSession | null>(initialSession ?? null)
  const [error, setError] = useState<Error | null>(null)

  const startSession = (difficulty: GameDifficulty) => {
    try {
      setSession(createReadingComprehensionSession(difficulty, createReadingComprehensionQuestions(difficulty)))
      setError(null)
      return true
    } catch (cause) {
      setSession(null)
      setError(cause instanceof Error ? cause : new Error('ぶんを よむ ゲームを開始できませんでした'))
      return false
    }
  }

  const updateSession = (operation: (current: ReadingComprehensionSession) => ReadingComprehensionSession) => {
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

  const selectChoice = (choiceId: string) => updateSession((current) => selectReadingComprehensionChoice(current, choiceId))
  const nextQuestion = () => updateSession(nextReadingComprehensionQuestion)

  const value = useMemo<ReadingComprehensionSessionContextValue>(
    () => ({ session, error, startSession, selectChoice, nextQuestion }),
    [session, error],
  )

  return <ReadingComprehensionSessionContext.Provider value={value}>{children}</ReadingComprehensionSessionContext.Provider>
}

export function useReadingComprehensionSession() {
  const context = useContext(ReadingComprehensionSessionContext)
  if (!context) throw new Error('ReadingComprehensionSessionProviderの内側で使用してください')
  return context
}
