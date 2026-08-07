import { createContext, useContext, useMemo, useState, type ReactNode } from 'react'
import { loadKanaToPictureQuestions } from '../question-types/kana-to-picture/model/loader'
import { adaptWordBuilderQuestions } from './model/wordBuilderQuestion'
import {
  createWordBuilderSession,
  nextWord as advanceToNextWord,
  selectTile as selectWordTile,
  submitWord as submitCurrentWord,
  undoLastTile as undoWordTile,
  type WordBuilderSession,
} from './model/wordBuilderSession'

type WordBuilderSessionContextValue = {
  session: WordBuilderSession | null
  error: Error | null
  startSession: () => boolean
  selectTile: (tileId: string) => void
  undoLastTile: () => void
  submitWord: () => void
  nextWord: () => void
}

const WordBuilderSessionContext = createContext<WordBuilderSessionContextValue | null>(null)

export type WordBuilderSessionProviderProps = {
  children: ReactNode
  initialSession?: WordBuilderSession
}

export function WordBuilderSessionProvider({ children, initialSession }: WordBuilderSessionProviderProps) {
  const [session, setSession] = useState<WordBuilderSession | null>(initialSession ?? null)
  const [error, setError] = useState<Error | null>(null)

  const startSession = () => {
    try {
      const questions = adaptWordBuilderQuestions(loadKanaToPictureQuestions())
      setSession(createWordBuilderSession(questions))
      setError(null)
      return true
    } catch (cause) {
      setSession(null)
      setError(cause instanceof Error ? cause : new Error('ことばのゲームを開始できませんでした'))
      return false
    }
  }

  const updateSession = (operation: (current: WordBuilderSession) => WordBuilderSession) => {
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

  const selectTile = (tileId: string) => updateSession((current) => selectWordTile(current, tileId))
  const undoLastTile = () => updateSession(undoWordTile)
  const submitWord = () => updateSession(submitCurrentWord)
  const nextWord = () => updateSession(advanceToNextWord)

  const value = useMemo<WordBuilderSessionContextValue>(
    () => ({ session, error, startSession, selectTile, undoLastTile, submitWord, nextWord }),
    [session, error],
  )

  return <WordBuilderSessionContext.Provider value={value}>{children}</WordBuilderSessionContext.Provider>
}

export function useWordBuilderSession() {
  const context = useContext(WordBuilderSessionContext)
  if (!context) throw new Error('WordBuilderSessionProviderの内側で使用してください')
  return context
}
