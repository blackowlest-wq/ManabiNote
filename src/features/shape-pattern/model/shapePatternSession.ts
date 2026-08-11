import { selectUniqueQuestions } from '../../quiz/model/questionSelection'
import type { ShapePatternQuestion } from './types'

export type ShapePatternFeedback = 'none' | 'incorrect' | 'correct'

export type ShapePatternSession = {
  id: string
  questions: readonly ShapePatternQuestion[]
  currentIndex: number
  selectedChoiceId: string | null
  feedback: ShapePatternFeedback
  startedAt: string
}

const currentQuestion = (session: ShapePatternSession): ShapePatternQuestion => {
  const question = session.questions[session.currentIndex]
  if (!question) throw new Error('現在の問題が見つかりません')
  return question
}

export function createShapePatternSession(
  questions: readonly ShapePatternQuestion[],
  now: () => Date = () => new Date(),
  random: () => number = Math.random,
): ShapePatternSession {
  const startedAt = now()
  const selectedQuestions = selectUniqueQuestions(questions, 5, random)
  if (!selectedQuestions[0]) throw new Error('最初の問題が見つかりません')

  return {
    id: `shape-pattern-${startedAt.getTime()}-${selectedQuestions.map((question) => question.id).join('-')}`,
    questions: selectedQuestions,
    currentIndex: 0,
    selectedChoiceId: null,
    feedback: 'none',
    startedAt: startedAt.toISOString(),
  }
}

export function selectShapePatternChoice(session: ShapePatternSession, choiceId: string): ShapePatternSession {
  if (isShapePatternComplete(session)) throw new Error('完了したセッションには回答できません')
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

export function nextShapePatternQuestion(session: ShapePatternSession): ShapePatternSession {
  if (session.feedback !== 'correct') throw new Error('正解した問題だけ次へ進めます')

  return {
    ...session,
    currentIndex: Math.min(session.currentIndex + 1, session.questions.length),
    selectedChoiceId: null,
    feedback: 'none',
  }
}

export function isShapePatternComplete(session: ShapePatternSession): boolean {
  return session.currentIndex >= session.questions.length
}
