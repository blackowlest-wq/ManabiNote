import { createContext, useContext, useMemo, useState, type ReactNode } from 'react'
import { createKanjiReadingQuestions } from './model/kanjiReadingQuestion'
import { createKanjiReadingSession, nextKanjiReadingQuestion, selectKanjiReadingChoice, type KanjiReadingSession } from './model/kanjiReadingSession'

type KanjiReadingSessionContextValue = {
  session: KanjiReadingSession | null
  error: Error | null
  startSession: () => boolean
  selectChoice: (choiceId: string) => void
  nextQuestion: () => void
}

const KanjiReadingSessionContext = createContext<KanjiReadingSessionContextValue | null>(null)

export type KanjiReadingSessionProviderProps = {
  children: ReactNode
  initialSession?: KanjiReadingSession
}

export function KanjiReadingSessionProvider({ children, initialSession }: KanjiReadingSessionProviderProps) {
  const [session, setSession] = useState<KanjiReadingSession | null>(initialSession ?? null)
  const [error, setError] = useState<Error | null>(null)

  const startSession = () => {
    try {
      setSession(createKanjiReadingSession(createKanjiReadingQuestions()))
      setError(null)
      return true
    } catch (cause) {
      setSession(null)
      setError(cause instanceof Error ? cause : new Error('かんじの ゲームを開始できませんでした'))
      return false
    }
  }

  const updateSession = (operation: (current: KanjiReadingSession) => KanjiReadingSession) => {
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

  const selectChoice = (choiceId: string) => updateSession((current) => selectKanjiReadingChoice(current, choiceId))
  const nextQuestion = () => updateSession(nextKanjiReadingQuestion)

  const value = useMemo<KanjiReadingSessionContextValue>(
    () => ({ session, error, startSession, selectChoice, nextQuestion }),
    [session, error],
  )

  return <KanjiReadingSessionContext.Provider value={value}>{children}</KanjiReadingSessionContext.Provider>
}

export function useKanjiReadingSession() {
  const context = useContext(KanjiReadingSessionContext)
  if (!context) throw new Error('KanjiReadingSessionProviderの内側で使用してください')
  return context
}
