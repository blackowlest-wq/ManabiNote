import { createContext, useContext, useMemo, useState, type ReactNode } from 'react'
import { createKanaGroupQuestions } from './model/kanaGroupQuestion'
import { createKanaGroupSession, nextKanaGroupQuestion, selectKanaGroupChoice, type KanaGroupSession } from './model/kanaGroupSession'

type KanaGroupSessionContextValue = {
  session: KanaGroupSession | null
  error: Error | null
  startSession: () => boolean
  selectChoice: (choiceId: string) => void
  nextQuestion: () => void
}

const KanaGroupSessionContext = createContext<KanaGroupSessionContextValue | null>(null)

export type KanaGroupSessionProviderProps = {
  children: ReactNode
  initialSession?: KanaGroupSession
}

export function KanaGroupSessionProvider({ children, initialSession }: KanaGroupSessionProviderProps) {
  const [session, setSession] = useState<KanaGroupSession | null>(initialSession ?? null)
  const [error, setError] = useState<Error | null>(null)

  const startSession = () => {
    try {
      setSession(createKanaGroupSession(createKanaGroupQuestions()))
      setError(null)
      return true
    } catch (cause) {
      setSession(null)
      setError(cause instanceof Error ? cause : new Error('かなの仲間分けゲームを開始できませんでした'))
      return false
    }
  }

  const updateSession = (operation: (current: KanaGroupSession) => KanaGroupSession) => {
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

  const selectChoice = (choiceId: string) => updateSession((current) => selectKanaGroupChoice(current, choiceId))
  const nextQuestion = () => updateSession(nextKanaGroupQuestion)

  const value = useMemo<KanaGroupSessionContextValue>(
    () => ({ session, error, startSession, selectChoice, nextQuestion }),
    [session, error],
  )

  return <KanaGroupSessionContext.Provider value={value}>{children}</KanaGroupSessionContext.Provider>
}

export function useKanaGroupSession() {
  const context = useContext(KanaGroupSessionContext)
  if (!context) throw new Error('KanaGroupSessionProviderの内側で使用してください')
  return context
}
