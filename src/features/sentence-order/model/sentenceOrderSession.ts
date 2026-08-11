import { selectUniqueQuestions } from '../../quiz/model/questionSelection'
import type { SentenceOrderQuestion } from './types'

export type SentenceOrderFeedback = 'none' | 'incorrect' | 'correct'

export type SentenceOrderSession = {
  id: string
  questions: readonly SentenceOrderQuestion[]
  currentIndex: number
  selectedChoiceIds: readonly string[]
  feedback: SentenceOrderFeedback
  startedAt: string
}

const currentQuestion = (session: SentenceOrderSession): SentenceOrderQuestion => {
  const question = session.questions[session.currentIndex]
  if (!question) throw new Error('現在の問題が見つかりません')
  return question
}

export function createSentenceOrderSession(
  questions: readonly SentenceOrderQuestion[],
  now: () => Date = () => new Date(),
  random: () => number = Math.random,
): SentenceOrderSession {
  const startedAt = now()
  const selectedQuestions = selectUniqueQuestions(questions, 5, random)
  if (!selectedQuestions[0]) throw new Error('最初の問題が見つかりません')

  return {
    id: `sentence-order-${startedAt.getTime()}-${selectedQuestions.map((question) => question.id).join('-')}`,
    questions: selectedQuestions,
    currentIndex: 0,
    selectedChoiceIds: [],
    feedback: 'none',
    startedAt: startedAt.toISOString(),
  }
}

export function selectSentenceOrderChoice(session: SentenceOrderSession, choiceId: string): SentenceOrderSession {
  if (isSentenceOrderComplete(session)) throw new Error('完了したセッションには回答できません')
  if (session.feedback === 'correct') throw new Error('正解した問題には回答できません')
  if (!choiceId) throw new Error('選択肢を指定してください')

  const question = currentQuestion(session)
  if (!question.choices.some((choice) => choice.id === choiceId)) throw new Error('無効な選択肢です')
  if (session.selectedChoiceIds.includes(choiceId)) throw new Error('同じことばは二度選べません')

  return {
    ...session,
    selectedChoiceIds: [...session.selectedChoiceIds, choiceId],
    feedback: 'none',
  }
}

export function undoSentenceOrderChoice(session: SentenceOrderSession): SentenceOrderSession {
  if (isSentenceOrderComplete(session)) throw new Error('完了したセッションは変更できません')
  if (!session.selectedChoiceIds.length) throw new Error('戻すことばがありません')

  return {
    ...session,
    selectedChoiceIds: session.selectedChoiceIds.slice(0, -1),
    feedback: 'none',
  }
}

export function submitSentenceOrder(session: SentenceOrderSession): SentenceOrderSession {
  if (isSentenceOrderComplete(session)) throw new Error('完了したセッションには回答できません')
  if (session.feedback === 'correct') throw new Error('正解した問題には回答できません')
  if (!session.selectedChoiceIds.length) throw new Error('ことばを選んでください')

  const question = currentQuestion(session)
  const isCorrect = session.selectedChoiceIds.length === question.correctChoiceIds.length &&
    session.selectedChoiceIds.every((choiceId, index) => choiceId === question.correctChoiceIds[index])

  return {
    ...session,
    feedback: isCorrect ? 'correct' : 'incorrect',
  }
}

export function nextSentenceOrderQuestion(session: SentenceOrderSession): SentenceOrderSession {
  if (session.feedback !== 'correct') throw new Error('正解した問題だけ次へ進めます')

  return {
    ...session,
    currentIndex: Math.min(session.currentIndex + 1, session.questions.length),
    selectedChoiceIds: [],
    feedback: 'none',
  }
}

export function isSentenceOrderComplete(session: SentenceOrderSession): boolean {
  return session.currentIndex >= session.questions.length
}
