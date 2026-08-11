import { createContext, useContext, useMemo, useState, type ReactNode } from 'react'
import { createKanaPairQuestions } from './model/kanaPairQuestion'
import {
  createKanaPairSession,
  nextKanaPairQuestion,
  selectKanaPairChoice,
  type KanaPairSession,
} from './model/kanaPairSession'

type KanaPairSessionContextValue = {
  session: KanaPairSession | null
  error: Error | null
  startSession: () => boolean
  selectChoice: (choiceId: string) => void
  nextQuestion: () => void
}

const KanaPairSessionContext = createContext<KanaPairSessionContextValue | null>(null)

export type KanaPairSessionProviderProps = {
  children: ReactNode
  initialSession?: KanaPairSession
}

export function KanaPairSessionProvider({ children, initialSession }: KanaPairSessionProviderProps) {
  const [session, setSession] = useState<KanaPairSession | null>(initialSession ?? null)
  const [error, setError] = useState<Error | null>(null)

  const startSession = () => {
    try {
      setSession(createKanaPairSession(createKanaPairQuestions()))
      setError(null)
      return true
    } catch (cause) {
      setSession(null)
      setError(cause instanceof Error ? cause : new Error('ひらがなとカタカナのゲームを開始できませんでした'))
      return false
    }
  }

  const updateSession = (operation: (current: KanaPairSession) => KanaPairSession) => {
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

  const selectChoice = (choiceId: string) => updateSession((current) => selectKanaPairChoice(current, choiceId))
  const nextQuestion = () => updateSession(nextKanaPairQuestion)

  const value = useMemo<KanaPairSessionContextValue>(
    () => ({ session, error, startSession, selectChoice, nextQuestion }),
    [session, error],
  )

  return <KanaPairSessionContext.Provider value={value}>{children}</KanaPairSessionContext.Provider>
}

export function useKanaPairSession() {
  const context = useContext(KanaPairSessionContext)
  if (!context) throw new Error('KanaPairSessionProviderの内側で使用してください')
  return context
}
