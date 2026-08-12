import { selectUniqueQuestions } from '../../quiz/model/questionSelection'
import type { KanjiToStrokeQuestion } from '../../question-types/kanji-to-stroke/model/types'

export type KanjiPracticeStatus = 'active' | 'character-complete' | 'complete'

export type KanjiPracticeSession = {
  id: string
  questions: readonly KanjiToStrokeQuestion[]
  currentQuestionIndex: number
  currentStrokeIndex: number
  attempts: readonly number[]
  status: KanjiPracticeStatus
  startedAt: string
}

export const createKanjiPracticeSession = (
  questions: readonly KanjiToStrokeQuestion[],
  now: () => Date = () => new Date(),
  random: () => number = Math.random,
): KanjiPracticeSession => {
  const startedAt = now()
  const selectedQuestions = selectUniqueQuestions(questions, 5, random)

  return {
    id: `kanji-stroke-practice-${startedAt.getTime()}-${selectedQuestions.map((question) => question.id).join('-')}`,
    questions: selectedQuestions,
    currentQuestionIndex: 0,
    currentStrokeIndex: 0,
    attempts: Array.from({ length: selectedQuestions.length }, () => 0),
    status: 'active',
    startedAt: startedAt.toISOString(),
  }
}

const ensureActive = (session: KanjiPracticeSession) => {
  if (session.status !== 'active') throw new Error('現在の画を練習できません')
}

export const recordKanjiStrokeFailure = (session: KanjiPracticeSession): KanjiPracticeSession => {
  ensureActive(session)
  const attempts = [...session.attempts]
  attempts[session.currentQuestionIndex] += 1

  return { ...session, attempts }
}

export const recordKanjiStrokeSuccess = (session: KanjiPracticeSession): KanjiPracticeSession => {
  ensureActive(session)
  const question = session.questions[session.currentQuestionIndex]
  if (!question) throw new Error('現在の漢字が見つかりません')

  const attempts = [...session.attempts]
  attempts[session.currentQuestionIndex] += 1
  const isLastStroke = session.currentStrokeIndex === question.strokes.length - 1

  return {
    ...session,
    attempts,
    currentStrokeIndex: isLastStroke ? session.currentStrokeIndex : session.currentStrokeIndex + 1,
    status: isLastStroke ? 'character-complete' : 'active',
  }
}

export const advanceKanjiCharacter = (session: KanjiPracticeSession): KanjiPracticeSession => {
  if (session.status !== 'character-complete') {
    throw new Error('漢字を完了してから次へ進んでください')
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

export const isKanjiPracticeComplete = (session: KanjiPracticeSession): boolean =>
  session.status === 'complete'
