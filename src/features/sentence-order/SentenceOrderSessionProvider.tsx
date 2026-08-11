import { createContext, useContext, useMemo, useState, type ReactNode } from 'react'
import { createSentenceOrderQuestions } from './model/sentenceOrderQuestion'
import {
  createSentenceOrderSession,
  nextSentenceOrderQuestion,
  selectSentenceOrderChoice,
  submitSentenceOrder,
  undoSentenceOrderChoice,
  type SentenceOrderSession,
} from './model/sentenceOrderSession'

type SentenceOrderSessionContextValue = {
  session: SentenceOrderSession | null
  error: Error | null
  startSession: () => boolean
  selectChoice: (choiceId: string) => void
  undoChoice: () => void
  submit: () => void
  nextQuestion: () => void
}

const SentenceOrderSessionContext = createContext<SentenceOrderSessionContextValue | null>(null)

export type SentenceOrderSessionProviderProps = {
  children: ReactNode
  initialSession?: SentenceOrderSession
}

export function SentenceOrderSessionProvider({ children, initialSession }: SentenceOrderSessionProviderProps) {
  const [session, setSession] = useState<SentenceOrderSession | null>(initialSession ?? null)
  const [error, setError] = useState<Error | null>(null)

  const startSession = () => {
    try {
      setSession(createSentenceOrderSession(createSentenceOrderQuestions()))
      setError(null)
      return true
    } catch (cause) {
      setSession(null)
      setError(cause instanceof Error ? cause : new Error('ぶんの ゲームを開始できませんでした'))
      return false
    }
  }

  const updateSession = (operation: (current: SentenceOrderSession) => SentenceOrderSession) => {
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

  const selectChoice = (choiceId: string) => updateSession((current) => selectSentenceOrderChoice(current, choiceId))
  const undoChoice = () => updateSession(undoSentenceOrderChoice)
  const submit = () => updateSession(submitSentenceOrder)
  const nextQuestion = () => updateSession(nextSentenceOrderQuestion)

  const value = useMemo<SentenceOrderSessionContextValue>(
    () => ({ session, error, startSession, selectChoice, undoChoice, submit, nextQuestion }),
    [session, error],
  )

  return <SentenceOrderSessionContext.Provider value={value}>{children}</SentenceOrderSessionContext.Provider>
}

export function useSentenceOrderSession() {
  const context = useContext(SentenceOrderSessionContext)
  if (!context) throw new Error('SentenceOrderSessionProviderの内側で使用してください')
  return context
}
