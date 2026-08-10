import { selectUniqueQuestions } from '../../quiz/model/questionSelection'
import type { MissingCharacterQuestion } from './types'

export type MissingCharacterFeedback = 'none' | 'incorrect' | 'correct'

export type MissingCharacterSession = {
  id: string
  questions: readonly MissingCharacterQuestion[]
  currentIndex: number
  selectedChoiceId: string | null
  feedback: MissingCharacterFeedback
  startedAt: string
}

const currentQuestion = (session: MissingCharacterSession): MissingCharacterQuestion => {
  const question = session.questions[session.currentIndex]
  if (!question) throw new Error('現在の問題が見つかりません')
  return question
}

export function createMissingCharacterSession(
  questions: readonly MissingCharacterQuestion[],
  now: () => Date = () => new Date(),
  random: () => number = Math.random,
): MissingCharacterSession {
  const startedAt = now()
  const selectedQuestions = selectUniqueQuestions(questions, 5, random)
  if (!selectedQuestions[0]) throw new Error('最初の問題が見つかりません')

  return {
    id: `missing-character-${startedAt.getTime()}-${selectedQuestions.map((question) => question.id).join('-')}`,
    questions: selectedQuestions,
    currentIndex: 0,
    selectedChoiceId: null,
    feedback: 'none',
    startedAt: startedAt.toISOString(),
  }
}

export function selectChoice(
  session: MissingCharacterSession,
  choiceId: string,
): MissingCharacterSession {
  if (isMissingCharacterComplete(session)) throw new Error('完了したセッションには回答できません')
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

export function nextMissingCharacterQuestion(
  session: MissingCharacterSession,
): MissingCharacterSession {
  if (session.feedback !== 'correct') throw new Error('正解した問題だけ次へ進めます')

  const nextIndex = session.currentIndex + 1
  if (nextIndex >= session.questions.length) {
    return {
      ...session,
      currentIndex: session.questions.length,
      selectedChoiceId: null,
      feedback: 'none',
    }
  }

  return {
    ...session,
    currentIndex: nextIndex,
    selectedChoiceId: null,
    feedback: 'none',
  }
}

export function isMissingCharacterComplete(session: MissingCharacterSession): boolean {
  return session.currentIndex >= session.questions.length
}
