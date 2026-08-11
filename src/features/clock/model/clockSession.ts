import { selectUniqueQuestions } from '../../quiz/model/questionSelection'
import type { GameDifficulty } from '../../../shared/gameDifficulty'
import type { ClockQuestion } from './types'

export type ClockFeedback = 'none' | 'incorrect' | 'correct'

export type ClockSession = {
  id: string
  difficulty: GameDifficulty
  questions: readonly ClockQuestion[]
  currentIndex: number
  selectedChoiceId: string | null
  feedback: ClockFeedback
  startedAt: string
}

const currentQuestion = (session: ClockSession): ClockQuestion => {
  const question = session.questions[session.currentIndex]
  if (!question) throw new Error('現在の問題が見つかりません')
  return question
}

export function createClockSession(
  difficulty: GameDifficulty,
  questions: readonly ClockQuestion[],
  now: () => Date = () => new Date(),
  random: () => number = Math.random,
): ClockSession {
  const startedAt = now()
  const selectedQuestions = selectUniqueQuestions(questions, 5, random)
  if (!selectedQuestions[0]) throw new Error('最初の問題が見つかりません')

  return {
    id: `clock-${difficulty}-${startedAt.getTime()}-${selectedQuestions.map((question) => question.id).join('-')}`,
    difficulty,
    questions: selectedQuestions,
    currentIndex: 0,
    selectedChoiceId: null,
    feedback: 'none',
    startedAt: startedAt.toISOString(),
  }
}

export function selectClockChoice(session: ClockSession, choiceId: string): ClockSession {
  if (isClockComplete(session)) throw new Error('完了したセッションには回答できません')
  if (session.feedback === 'correct') throw new Error('正解した問題には回答できません')
  if (!choiceId) throw new Error('選択肢を指定してください')

  const question = currentQuestion(session)
  if (!question.choices.some((choice) => choice.id === choiceId)) throw new Error('無効な選択肢です')

  return {
    ...session,
    selectedChoiceId: choiceId,
    feedback: choiceId === question.correctChoiceId ? 'correct' : 'incorrect',
  }
}

export function nextClockQuestion(session: ClockSession): ClockSession {
  if (session.feedback !== 'correct') throw new Error('正解した問題だけ次へ進めます')

  return {
    ...session,
    currentIndex: Math.min(session.currentIndex + 1, session.questions.length),
    selectedChoiceId: null,
    feedback: 'none',
  }
}

export function isClockComplete(session: ClockSession): boolean {
  return session.currentIndex >= session.questions.length
}
