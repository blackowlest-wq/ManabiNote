import { createContext, useContext, useMemo, useState, type ReactNode } from 'react'
import type { GameDifficulty } from '../../shared/gameDifficulty'
import { createParticleChoiceQuestions } from './model/particleChoiceQuestion'
import { createParticleChoiceSession, nextParticleChoiceQuestion, selectParticleChoice, type ParticleChoiceSession } from './model/particleChoiceSession'

type ParticleChoiceSessionContextValue = {
  session: ParticleChoiceSession | null
  error: Error | null
  startSession: (difficulty: GameDifficulty) => boolean
  selectChoice: (choiceId: string) => void
  nextQuestion: () => void
}

const ParticleChoiceSessionContext = createContext<ParticleChoiceSessionContextValue | null>(null)

export type ParticleChoiceSessionProviderProps = {
  children: ReactNode
  initialSession?: ParticleChoiceSession
}

export function ParticleChoiceSessionProvider({ children, initialSession }: ParticleChoiceSessionProviderProps) {
  const [session, setSession] = useState<ParticleChoiceSession | null>(initialSession ?? null)
  const [error, setError] = useState<Error | null>(null)

  const startSession = (difficulty: GameDifficulty) => {
    try {
      setSession(createParticleChoiceSession(difficulty, createParticleChoiceQuestions(difficulty)))
      setError(null)
      return true
    } catch (cause) {
      setSession(null)
      setError(cause instanceof Error ? cause : new Error('ぶんの ゲームを開始できませんでした'))
      return false
    }
  }

  const updateSession = (operation: (current: ParticleChoiceSession) => ParticleChoiceSession) => {
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

  const selectChoice = (choiceId: string) => updateSession((current) => selectParticleChoice(current, choiceId))
  const nextQuestion = () => updateSession(nextParticleChoiceQuestion)

  const value = useMemo<ParticleChoiceSessionContextValue>(
    () => ({ session, error, startSession, selectChoice, nextQuestion }),
    [session, error],
  )

  return <ParticleChoiceSessionContext.Provider value={value}>{children}</ParticleChoiceSessionContext.Provider>
}

export function useParticleChoiceSession() {
  const context = useContext(ParticleChoiceSessionContext)
  if (!context) throw new Error('ParticleChoiceSessionProviderの内側で使用してください')
  return context
}
