import { selectUniqueQuestions } from '../../quiz/model/questionSelection'
import type { KanaPairQuestion } from './types'

export type KanaPairFeedback = 'none' | 'incorrect' | 'correct'

export type KanaPairSession = {
  id: string
  questions: readonly KanaPairQuestion[]
  currentIndex: number
  selectedChoiceId: string | null
  feedback: KanaPairFeedback
  startedAt: string
}

const currentQuestion = (session: KanaPairSession): KanaPairQuestion => {
  const question = session.questions[session.currentIndex]
  if (!question) throw new Error('現在の問題が見つかりません')
  return question
}

export function createKanaPairSession(
  questions: readonly KanaPairQuestion[],
  now: () => Date = () => new Date(),
  random: () => number = Math.random,
): KanaPairSession {
  const startedAt = now()
  const selectedQuestions = selectUniqueQuestions(questions, 5, random)
  if (!selectedQuestions[0]) throw new Error('最初の問題が見つかりません')

  return {
    id: `kana-pair-${startedAt.getTime()}-${selectedQuestions.map((question) => question.id).join('-')}`,
    questions: selectedQuestions,
    currentIndex: 0,
    selectedChoiceId: null,
    feedback: 'none',
    startedAt: startedAt.toISOString(),
  }
}

export function selectKanaPairChoice(
  session: KanaPairSession,
  choiceId: string,
): KanaPairSession {
  if (isKanaPairComplete(session)) throw new Error('完了したセッションには回答できません')
  if (session.feedback === 'correct') throw new Error('正解した問題には回答できません')
  if (!choiceId) throw new Error('選択肢を指定してください')

  const question = currentQuestion(session)
  if (!question.choices.some((choice) => choice.id === choiceId)) {
    throw new Error('無効な選択肢です')
  }

  return {
    ...session,
    selectedChoiceId: choiceId,
    feedback: choiceId === question.correctChoiceId ? 'correct' : 'incorrect',
  }
}

export function nextKanaPairQuestion(session: KanaPairSession): KanaPairSession {
  if (session.feedback !== 'correct') throw new Error('正解した問題だけ次へ進めます')

  const nextIndex = session.currentIndex + 1
  return {
    ...session,
    currentIndex: Math.min(nextIndex, session.questions.length),
    selectedChoiceId: null,
    feedback: 'none',
  }
}

export function isKanaPairComplete(session: KanaPairSession): boolean {
  return session.currentIndex >= session.questions.length
}
