import { selectUniqueQuestions } from '../../quiz/model/questionSelection'
import type { ShiritoriQuestion } from './types'

export type ShiritoriFeedback = 'none' | 'incorrect' | 'correct'

export type ShiritoriSession = {
  id: string
  questions: readonly ShiritoriQuestion[]
  currentIndex: number
  selectedChoiceId: string | null
  feedback: ShiritoriFeedback
  startedAt: string
}

const currentQuestion = (session: ShiritoriSession): ShiritoriQuestion => {
  const question = session.questions[session.currentIndex]
  if (!question) throw new Error('現在の問題が見つかりません')
  return question
}

export function createShiritoriSession(
  questions: readonly ShiritoriQuestion[],
  now: () => Date = () => new Date(),
  random: () => number = Math.random,
): ShiritoriSession {
  const startedAt = now()
  const selectedQuestions = selectUniqueQuestions(questions, 5, random)
  if (!selectedQuestions[0]) throw new Error('最初の問題が見つかりません')

  return {
    id: `shiritori-${startedAt.getTime()}-${selectedQuestions.map((question) => question.id).join('-')}`,
    questions: selectedQuestions,
    currentIndex: 0,
    selectedChoiceId: null,
    feedback: 'none',
    startedAt: startedAt.toISOString(),
  }
}

export function selectShiritoriChoice(session: ShiritoriSession, choiceId: string): ShiritoriSession {
  if (isShiritoriComplete(session)) throw new Error('完了したセッションには回答できません')
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

export function nextShiritoriQuestion(session: ShiritoriSession): ShiritoriSession {
  if (session.feedback !== 'correct') throw new Error('正解した問題だけ次へ進めます')

  return {
    ...session,
    currentIndex: Math.min(session.currentIndex + 1, session.questions.length),
    selectedChoiceId: null,
    feedback: 'none',
  }
}

export function isShiritoriComplete(session: ShiritoriSession): boolean {
  return session.currentIndex >= session.questions.length
}
