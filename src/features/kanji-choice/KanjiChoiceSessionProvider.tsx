import { createContext, useContext, useMemo, useState, type ReactNode } from 'react'
import { createKanjiChoiceQuestions } from './model/kanjiChoiceQuestion'
import { createKanjiChoiceSession, nextKanjiChoiceQuestion, selectKanjiChoice, type KanjiChoiceSession } from './model/kanjiChoiceSession'

type KanjiChoiceSessionContextValue = {
  session: KanjiChoiceSession | null
  error: Error | null
  startSession: () => boolean
  selectChoice: (choiceId: string) => void
  nextQuestion: () => void
}

const KanjiChoiceSessionContext = createContext<KanjiChoiceSessionContextValue | null>(null)

export type KanjiChoiceSessionProviderProps = {
  children: ReactNode
  initialSession?: KanjiChoiceSession
}

export function KanjiChoiceSessionProvider({ children, initialSession }: KanjiChoiceSessionProviderProps) {
  const [session, setSession] = useState<KanjiChoiceSession | null>(initialSession ?? null)
  const [error, setError] = useState<Error | null>(null)

  const startSession = () => {
    try {
      setSession(createKanjiChoiceSession(createKanjiChoiceQuestions()))
      setError(null)
      return true
    } catch (cause) {
      setSession(null)
      setError(cause instanceof Error ? cause : new Error('かんじの ゲームを開始できませんでした'))
      return false
    }
  }

  const updateSession = (operation: (current: KanjiChoiceSession) => KanjiChoiceSession) => {
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

  const selectChoice = (choiceId: string) => updateSession((current) => selectKanjiChoice(current, choiceId))
  const nextQuestion = () => updateSession(nextKanjiChoiceQuestion)

  const value = useMemo<KanjiChoiceSessionContextValue>(
    () => ({ session, error, startSession, selectChoice, nextQuestion }),
    [session, error],
  )

  return <KanjiChoiceSessionContext.Provider value={value}>{children}</KanjiChoiceSessionContext.Provider>
}

export function useKanjiChoiceSession() {
  const context = useContext(KanjiChoiceSessionContext)
  if (!context) throw new Error('KanjiChoiceSessionProviderの内側で使用してください')
  return context
}
