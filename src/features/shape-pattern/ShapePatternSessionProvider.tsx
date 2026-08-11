import { createContext, useContext, useMemo, useState, type ReactNode } from 'react'
import { createShapePatternQuestions } from './model/shapePatternQuestion'
import { createShapePatternSession, nextShapePatternQuestion, selectShapePatternChoice, type ShapePatternSession } from './model/shapePatternSession'

type ShapePatternSessionContextValue = {
  session: ShapePatternSession | null
  error: Error | null
  startSession: () => boolean
  selectChoice: (choiceId: string) => void
  nextQuestion: () => void
}

const ShapePatternSessionContext = createContext<ShapePatternSessionContextValue | null>(null)

export type ShapePatternSessionProviderProps = {
  children: ReactNode
  initialSession?: ShapePatternSession
}

export function ShapePatternSessionProvider({ children, initialSession }: ShapePatternSessionProviderProps) {
  const [session, setSession] = useState<ShapePatternSession | null>(initialSession ?? null)
  const [error, setError] = useState<Error | null>(null)

  const startSession = () => {
    try {
      setSession(createShapePatternSession(createShapePatternQuestions()))
      setError(null)
      return true
    } catch (cause) {
      setSession(null)
      setError(cause instanceof Error ? cause : new Error('かたちの ゲームを開始できませんでした'))
      return false
    }
  }

  const updateSession = (operation: (current: ShapePatternSession) => ShapePatternSession) => {
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

  const selectChoice = (choiceId: string) => updateSession((current) => selectShapePatternChoice(current, choiceId))
  const nextQuestion = () => updateSession(nextShapePatternQuestion)

  const value = useMemo<ShapePatternSessionContextValue>(
    () => ({ session, error, startSession, selectChoice, nextQuestion }),
    [session, error],
  )

  return <ShapePatternSessionContext.Provider value={value}>{children}</ShapePatternSessionContext.Provider>
}

export function useShapePatternSession() {
  const context = useContext(ShapePatternSessionContext)
  if (!context) throw new Error('ShapePatternSessionProviderの内側で使用してください')
  return context
}
