import { selectUniqueQuestions } from '../../quiz/model/questionSelection'
import type { KanaGroupQuestion } from './types'

export type KanaGroupFeedback = 'none' | 'incorrect' | 'correct'

export type KanaGroupSession = {
  id: string
  questions: readonly KanaGroupQuestion[]
  currentIndex: number
  selectedChoiceId: string | null
  feedback: KanaGroupFeedback
  startedAt: string
}

const currentQuestion = (session: KanaGroupSession): KanaGroupQuestion => {
  const question = session.questions[session.currentIndex]
  if (!question) throw new Error('現在の問題が見つかりません')
  return question
}

export function createKanaGroupSession(
  questions: readonly KanaGroupQuestion[],
  now: () => Date = () => new Date(),
  random: () => number = Math.random,
): KanaGroupSession {
  const startedAt = now()
  const selectedQuestions = selectUniqueQuestions(questions, 5, random)
  if (!selectedQuestions[0]) throw new Error('最初の問題が見つかりません')

  return {
    id: `kana-group-${startedAt.getTime()}-${selectedQuestions.map((question) => question.id).join('-')}`,
    questions: selectedQuestions,
    currentIndex: 0,
    selectedChoiceId: null,
    feedback: 'none',
    startedAt: startedAt.toISOString(),
  }
}

export function selectKanaGroupChoice(session: KanaGroupSession, choiceId: string): KanaGroupSession {
  if (isKanaGroupComplete(session)) throw new Error('完了したセッションには回答できません')
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

export function nextKanaGroupQuestion(session: KanaGroupSession): KanaGroupSession {
  if (session.feedback !== 'correct') throw new Error('正解した問題だけ次へ進めます')

  return {
    ...session,
    currentIndex: Math.min(session.currentIndex + 1, session.questions.length),
    selectedChoiceId: null,
    feedback: 'none',
  }
}

export function isKanaGroupComplete(session: KanaGroupSession): boolean {
  return session.currentIndex >= session.questions.length
}
