import { selectUniqueQuestions } from '../../quiz/model/questionSelection'
import type { ShapeColorQuestion } from './types'

export type ShapeColorFeedback = 'none' | 'incorrect' | 'correct'

export type ShapeColorSession = {
  id: string
  questions: readonly ShapeColorQuestion[]
  currentIndex: number
  selectedChoiceId: string | null
  feedback: ShapeColorFeedback
  startedAt: string
}

const currentQuestion = (session: ShapeColorSession): ShapeColorQuestion => {
  const question = session.questions[session.currentIndex]
  if (!question) throw new Error('現在の問題が見つかりません')
  return question
}

export function createShapeColorSession(
  questions: readonly ShapeColorQuestion[],
  now: () => Date = () => new Date(),
  random: () => number = Math.random,
): ShapeColorSession {
  const startedAt = now()
  const selectedQuestions = selectUniqueQuestions(questions, 5, random)
  if (!selectedQuestions[0]) throw new Error('最初の問題が見つかりません')

  return {
    id: `shape-color-${startedAt.getTime()}-${selectedQuestions.map((question) => question.id).join('-')}`,
    questions: selectedQuestions,
    currentIndex: 0,
    selectedChoiceId: null,
    feedback: 'none',
    startedAt: startedAt.toISOString(),
  }
}

export function selectShapeColorChoice(session: ShapeColorSession, choiceId: string): ShapeColorSession {
  if (isShapeColorComplete(session)) throw new Error('完了したセッションには回答できません')
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

export function nextShapeColorQuestion(session: ShapeColorSession): ShapeColorSession {
  if (session.feedback !== 'correct') throw new Error('正解した問題だけ次へ進めます')

  return {
    ...session,
    currentIndex: Math.min(session.currentIndex + 1, session.questions.length),
    selectedChoiceId: null,
    feedback: 'none',
  }
}

export function isShapeColorComplete(session: ShapeColorSession): boolean {
  return session.currentIndex >= session.questions.length
}
