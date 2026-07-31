import { getStrokeRow, type StrokeRowId } from '../../question-types/kana-to-stroke/model/kanaRows'
import type { KanaToStrokeQuestion } from '../../question-types/kana-to-stroke/model/types'

export type PracticeStatus = 'active' | 'character-complete' | 'complete'

export type PracticeSession = {
  id: string
  rowId: StrokeRowId
  questions: readonly KanaToStrokeQuestion[]
  currentQuestionIndex: number
  currentStrokeIndex: number
  attempts: readonly number[]
  status: PracticeStatus
  startedAt: string
}

const isQuestionSetForRow = (questions: readonly KanaToStrokeQuestion[], rowId: StrokeRowId): boolean => {
  const row = getStrokeRow(rowId)
  return questions.length === row.kana.length && questions.every(
    (question, index) => question.type === 'kana-to-stroke' && question.kana === row.kana[index],
  )
}

export const createPracticeSession = (
  questions: readonly KanaToStrokeQuestion[],
  rowId: StrokeRowId,
  now: () => Date = () => new Date(),
): PracticeSession => {
  if (!isQuestionSetForRow(questions, rowId)) {
    throw new Error(`${getStrokeRow(rowId).label}の練習データが必要です`)
  }

  const startedAt = now()
  return {
    id: 'stroke-practice-' + startedAt.getTime(),
    rowId,
    questions: [...questions],
    currentQuestionIndex: 0,
    currentStrokeIndex: 0,
    attempts: Array.from({ length: questions.length }, () => 0),
    status: 'active',
    startedAt: startedAt.toISOString(),
  }
}

const ensureActive = (session: PracticeSession) => {
  if (session.status !== 'active') {
    throw new Error('現在の画を練習できません')
  }
}

export const recordStrokeFailure = (session: PracticeSession): PracticeSession => {
  ensureActive(session)
  const attempts = [...session.attempts]
  attempts[session.currentQuestionIndex] += 1

  return {
    ...session,
    attempts,
  }
}

export const recordStrokeSuccess = (session: PracticeSession): PracticeSession => {
  ensureActive(session)
  const question = session.questions[session.currentQuestionIndex]
  if (!question) {
    throw new Error('現在の文字が見つかりません')
  }

  const attempts = [...session.attempts]
  attempts[session.currentQuestionIndex] += 1
  const isLastStroke = session.currentStrokeIndex === question.strokes.length - 1

  return {
    ...session,
    attempts,
    currentStrokeIndex: isLastStroke
      ? session.currentStrokeIndex
      : session.currentStrokeIndex + 1,
    status: isLastStroke ? 'character-complete' : 'active',
  }
}

export const advanceCharacter = (session: PracticeSession): PracticeSession => {
  if (session.status !== 'character-complete') {
    throw new Error('文字を完了してから次へ進んでください')
  }

  const nextQuestionIndex = session.currentQuestionIndex + 1
  if (nextQuestionIndex >= session.questions.length) {
    return {
      ...session,
      currentQuestionIndex: session.questions.length,
      currentStrokeIndex: 0,
      status: 'complete',
    }
  }

  return {
    ...session,
    currentQuestionIndex: nextQuestionIndex,
    currentStrokeIndex: 0,
    status: 'active',
  }
}

export const getCurrentQuestion = (
  session: PracticeSession,
): KanaToStrokeQuestion | null => {
  if (session.status === 'complete') {
    return null
  }

  return session.questions[session.currentQuestionIndex] ?? null
}

export const isPracticeComplete = (session: PracticeSession): boolean =>
  session.status === 'complete'
