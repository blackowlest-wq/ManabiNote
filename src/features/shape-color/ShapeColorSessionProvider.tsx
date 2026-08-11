import { createContext, useContext, useMemo, useState, type ReactNode } from 'react'
import { createShapeColorQuestions } from './model/shapeColorQuestion'
import { createShapeColorSession, nextShapeColorQuestion, selectShapeColorChoice, type ShapeColorSession } from './model/shapeColorSession'

type ShapeColorSessionContextValue = {
  session: ShapeColorSession | null
  error: Error | null
  startSession: () => boolean
  selectChoice: (choiceId: string) => void
  nextQuestion: () => void
}

const ShapeColorSessionContext = createContext<ShapeColorSessionContextValue | null>(null)

export type ShapeColorSessionProviderProps = {
  children: ReactNode
  initialSession?: ShapeColorSession
}

export function ShapeColorSessionProvider({ children, initialSession }: ShapeColorSessionProviderProps) {
  const [session, setSession] = useState<ShapeColorSession | null>(initialSession ?? null)
  const [error, setError] = useState<Error | null>(null)

  const startSession = () => {
    try {
      setSession(createShapeColorSession(createShapeColorQuestions()))
      setError(null)
      return true
    } catch (cause) {
      setSession(null)
      setError(cause instanceof Error ? cause : new Error('色と形のゲームを開始できませんでした'))
      return false
    }
  }

  const updateSession = (operation: (current: ShapeColorSession) => ShapeColorSession) => {
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

  const selectChoice = (choiceId: string) => updateSession((current) => selectShapeColorChoice(current, choiceId))
  const nextQuestion = () => updateSession(nextShapeColorQuestion)

  const value = useMemo<ShapeColorSessionContextValue>(
    () => ({ session, error, startSession, selectChoice, nextQuestion }),
    [session, error],
  )

  return <ShapeColorSessionContext.Provider value={value}>{children}</ShapeColorSessionContext.Provider>
}

export function useShapeColorSession() {
  const context = useContext(ShapeColorSessionContext)
  if (!context) throw new Error('ShapeColorSessionProviderの内側で使用してください')
  return context
}
