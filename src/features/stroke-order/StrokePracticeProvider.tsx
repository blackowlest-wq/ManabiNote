import { createContext, useContext, useMemo, useState, type ReactNode } from 'react'
import { loadStrokeQuestionsForRow } from '../question-types/kana-to-stroke/model/loader'
import type { StrokeRowId } from '../question-types/kana-to-stroke/model/kanaRows'
import {
  advanceCharacter,
  createPracticeSession,
  recordStrokeFailure,
  recordStrokeSuccess,
  type PracticeSession,
} from './model/practiceSession'

type StrokePracticeContextValue = {
  session: PracticeSession | null
  error: Error | null
  startPractice: (rowId: StrokeRowId) => boolean
  recordFailure: () => void
  recordSuccess: () => void
  nextCharacter: () => void
}

const StrokePracticeContext = createContext<StrokePracticeContextValue | null>(null)

export type StrokePracticeProviderProps = {
  children: ReactNode
  initialSession?: PracticeSession
}

const toError = (cause: unknown, fallback: string): Error =>
  cause instanceof Error ? cause : new Error(fallback)

export function StrokePracticeProvider({
  children,
  initialSession,
}: StrokePracticeProviderProps) {
  const [session, setSession] = useState<PracticeSession | null>(initialSession ?? null)
  const [error, setError] = useState<Error | null>(null)

  const startPractice = (rowId: StrokeRowId) => {
    try {
      const nextSession = createPracticeSession(loadStrokeQuestionsForRow(rowId), rowId)
      setSession(nextSession)
      setError(null)
      return true
    } catch {
      setSession(null)
      setError(new Error('書き順練習を開始できませんでした。'))
      return false
    }
  }

  const recordFailure = () => {
    setSession((current) => {
      if (!current) return current
      try {
        setError(null)
        return recordStrokeFailure(current)
      } catch (cause) {
        setError(toError(cause, 'なぞり結果を記録できませんでした。'))
        return current
      }
    })
  }

  const recordSuccess = () => {
    setSession((current) => {
      if (!current) return current
      try {
        setError(null)
        return recordStrokeSuccess(current)
      } catch (cause) {
        setError(toError(cause, 'なぞり結果を記録できませんでした。'))
        return current
      }
    })
  }

  const nextCharacter = () => {
    setSession((current) => {
      if (!current) return current
      try {
        setError(null)
        return advanceCharacter(current)
      } catch (cause) {
        setError(toError(cause, '次の文字へ進めませんでした。'))
        return current
      }
    })
  }

  const value = useMemo<StrokePracticeContextValue>(
    () => ({ session, error, startPractice, recordFailure, recordSuccess, nextCharacter }),
    [session, error],
  )

  return (
    <StrokePracticeContext.Provider value={value}>
      {children}
    </StrokePracticeContext.Provider>
  )
}

export function useStrokePractice() {
  const context = useContext(StrokePracticeContext)
  if (!context) throw new Error('StrokePracticeProviderの内側で使用してください')
  return context
}
