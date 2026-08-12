import { createContext, useContext, useMemo, useState, type ReactNode } from 'react'
import { loadKanjiStrokeQuestions } from '../question-types/kanji-to-stroke/model/loader'
import {
  advanceKanjiCharacter,
  createKanjiPracticeSession,
  recordKanjiStrokeFailure,
  recordKanjiStrokeSuccess,
  type KanjiPracticeSession,
} from './model/kanjiPracticeSession'

type KanjiStrokePracticeContextValue = {
  session: KanjiPracticeSession | null
  error: Error | null
  startPractice: () => boolean
  resetPractice: () => void
  recordFailure: () => void
  recordSuccess: () => void
  nextCharacter: () => void
}

const KanjiStrokePracticeContext = createContext<KanjiStrokePracticeContextValue | null>(null)

export type KanjiStrokePracticeProviderProps = {
  children: ReactNode
  initialSession?: KanjiPracticeSession
}

const toError = (cause: unknown, fallback: string): Error =>
  cause instanceof Error ? cause : new Error(fallback)

export function KanjiStrokePracticeProvider({
  children,
  initialSession,
}: KanjiStrokePracticeProviderProps) {
  const [session, setSession] = useState<KanjiPracticeSession | null>(initialSession ?? null)
  const [error, setError] = useState<Error | null>(null)

  const startPractice = () => {
    try {
      setSession(createKanjiPracticeSession(loadKanjiStrokeQuestions()))
      setError(null)
      return true
    } catch (cause) {
      setSession(null)
      setError(toError(cause, '漢字の書き順練習を開始できませんでした。'))
      return false
    }
  }

  const resetPractice = () => {
    setSession(null)
    setError(null)
  }

  const recordFailure = () => {
    setSession((current) => {
      if (!current) return current
      try {
        setError(null)
        return recordKanjiStrokeFailure(current)
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
        return recordKanjiStrokeSuccess(current)
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
        return advanceKanjiCharacter(current)
      } catch (cause) {
        setError(toError(cause, '次の漢字へ進めませんでした。'))
        return current
      }
    })
  }

  const value = useMemo<KanjiStrokePracticeContextValue>(
    () => ({ session, error, startPractice, resetPractice, recordFailure, recordSuccess, nextCharacter }),
    [session, error],
  )

  return (
    <KanjiStrokePracticeContext.Provider value={value}>
      {children}
    </KanjiStrokePracticeContext.Provider>
  )
}

export function useKanjiStrokePractice() {
  const context = useContext(KanjiStrokePracticeContext)
  if (!context) throw new Error('KanjiStrokePracticeProviderの内側で使用してください')
  return context
}
