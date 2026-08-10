import { createContext, useContext, useMemo, useState, type ReactNode } from 'react'
import { loadKanaToPictureQuestions } from '../question-types/kana-to-picture/model/loader'
import { adaptMissingCharacterQuestions } from './model/missingCharacterQuestion'
import {
  createMissingCharacterSession,
  nextMissingCharacterQuestion,
  selectChoice as selectMissingCharacterChoice,
  type MissingCharacterSession,
} from './model/missingCharacterSession'

type MissingCharacterSessionContextValue = {
  session: MissingCharacterSession | null
  error: Error | null
  startSession: () => boolean
  selectChoice: (choiceId: string) => void
  nextQuestion: () => void
}

const MissingCharacterSessionContext = createContext<MissingCharacterSessionContextValue | null>(null)

export type MissingCharacterSessionProviderProps = {
  children: ReactNode
  initialSession?: MissingCharacterSession
}

export function MissingCharacterSessionProvider({ children, initialSession }: MissingCharacterSessionProviderProps) {
  const [session, setSession] = useState<MissingCharacterSession | null>(initialSession ?? null)
  const [error, setError] = useState<Error | null>(null)

  const startSession = () => {
    try {
      const questions = adaptMissingCharacterQuestions(loadKanaToPictureQuestions())
      setSession(createMissingCharacterSession(questions))
      setError(null)
      return true
    } catch (cause) {
      setSession(null)
      setError(cause instanceof Error ? cause : new Error('ことばのあなうめを開始できませんでした'))
      return false
    }
  }

  const updateSession = (operation: (current: MissingCharacterSession) => MissingCharacterSession) => {
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

  const selectChoice = (choiceId: string) => updateSession((current) => selectMissingCharacterChoice(current, choiceId))
  const nextQuestion = () => updateSession(nextMissingCharacterQuestion)

  const value = useMemo<MissingCharacterSessionContextValue>(
    () => ({ session, error, startSession, selectChoice, nextQuestion }),
    [session, error],
  )

  return <MissingCharacterSessionContext.Provider value={value}>{children}</MissingCharacterSessionContext.Provider>
}

export function useMissingCharacterSession() {
  const context = useContext(MissingCharacterSessionContext)
  if (!context) throw new Error('MissingCharacterSessionProviderの内側で使用してください')
  return context
}
