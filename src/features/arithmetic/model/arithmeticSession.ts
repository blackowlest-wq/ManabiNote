import { selectUniqueQuestions } from '../../quiz/model/questionSelection'
import type { ArithmeticKind, ArithmeticQuestion } from './types'

export type ArithmeticFeedback = 'none' | 'incorrect' | 'correct'

export type ArithmeticSession = {
  id: string
  kind: ArithmeticKind
  questions: readonly ArithmeticQuestion[]
  currentIndex: number
  selectedChoiceId: string | null
  feedback: ArithmeticFeedback
  startedAt: string
}

const currentQuestion = (session: ArithmeticSession): ArithmeticQuestion => {
  const question = session.questions[session.currentIndex]
  if (!question) throw new Error('現在の問題が見つかりません')
  return question
}

export function createArithmeticSession(
  kind: ArithmeticKind,
  questions: readonly ArithmeticQuestion[],
  now: () => Date = () => new Date(),
  random: () => number = Math.random,
): ArithmeticSession {
  if (questions.some((question) => question.kind !== kind)) throw new Error('計算の種類が一致しません')

  const startedAt = now()
  const selectedQuestions = selectUniqueQuestions(questions, 5, random)
  if (!selectedQuestions[0]) throw new Error('最初の問題が見つかりません')

  return {
    id: `${kind}-${startedAt.getTime()}-${selectedQuestions.map((question) => question.id).join('-')}`,
    kind,
    questions: selectedQuestions,
    currentIndex: 0,
    selectedChoiceId: null,
    feedback: 'none',
    startedAt: startedAt.toISOString(),
  }
}

export function selectArithmeticChoice(session: ArithmeticSession, choiceId: string): ArithmeticSession {
  if (isArithmeticComplete(session)) throw new Error('完了したセッションには回答できません')
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

export function nextArithmeticQuestion(session: ArithmeticSession): ArithmeticSession {
  if (session.feedback !== 'correct') throw new Error('正解した問題だけ次へ進めます')

  return {
    ...session,
    currentIndex: Math.min(session.currentIndex + 1, session.questions.length),
    selectedChoiceId: null,
    feedback: 'none',
  }
}

export function isArithmeticComplete(session: ArithmeticSession): boolean {
  return session.currentIndex >= session.questions.length
}
