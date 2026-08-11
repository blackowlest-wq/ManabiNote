import { createContext, useContext, useMemo, useState, type ReactNode } from 'react'
import { createAudioKanaQuestions } from './model/audioKanaQuestion'
import { createAudioKanaSession, nextAudioKanaQuestion, selectAudioKanaChoice, type AudioKanaSession } from './model/audioKanaSession'

type AudioKanaSessionContextValue = {
  session: AudioKanaSession | null
  error: Error | null
  startSession: () => boolean
  selectChoice: (choiceId: string) => void
  nextQuestion: () => void
}

const AudioKanaSessionContext = createContext<AudioKanaSessionContextValue | null>(null)

export type AudioKanaSessionProviderProps = {
  children: ReactNode
  initialSession?: AudioKanaSession
}

export function AudioKanaSessionProvider({ children, initialSession }: AudioKanaSessionProviderProps) {
  const [session, setSession] = useState<AudioKanaSession | null>(initialSession ?? null)
  const [error, setError] = useState<Error | null>(null)

  const startSession = () => {
    try {
      setSession(createAudioKanaSession(createAudioKanaQuestions()))
      setError(null)
      return true
    } catch (cause) {
      setSession(null)
      setError(cause instanceof Error ? cause : new Error('音をきくゲームを開始できませんでした'))
      return false
    }
  }

  const updateSession = (operation: (current: AudioKanaSession) => AudioKanaSession) => {
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

  const selectChoice = (choiceId: string) => updateSession((current) => selectAudioKanaChoice(current, choiceId))
  const nextQuestion = () => updateSession(nextAudioKanaQuestion)

  const value = useMemo<AudioKanaSessionContextValue>(
    () => ({ session, error, startSession, selectChoice, nextQuestion }),
    [session, error],
  )

  return <AudioKanaSessionContext.Provider value={value}>{children}</AudioKanaSessionContext.Provider>
}

export function useAudioKanaSession() {
  const context = useContext(AudioKanaSessionContext)
  if (!context) throw new Error('AudioKanaSessionProviderの内側で使用してください')
  return context
}
