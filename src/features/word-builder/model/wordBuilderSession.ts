import { selectUniqueQuestions } from '../../quiz/model/questionSelection'
import { createWordTiles } from './wordBuilderQuestion'
import type { WordBuilderQuestion, WordTile } from './types'

export type WordBuilderFeedback = 'none' | 'incorrect' | 'correct'

export type WordBuilderSession = {
  id: string
  questions: readonly WordBuilderQuestion[]
  currentIndex: number
  tiles: readonly WordTile[]
  selectedTileIds: readonly string[]
  feedback: WordBuilderFeedback
  startedAt: string
}

const currentQuestion = (session: WordBuilderSession): WordBuilderQuestion => {
  const question = session.questions[session.currentIndex]
  if (!question) throw new Error('現在の問題が見つかりません')
  return question
}

const currentReadingLength = (session: WordBuilderSession): number =>
  Array.from(currentQuestion(session).reading).length

export function createWordBuilderSession(
  questions: readonly WordBuilderQuestion[],
  now: () => Date = () => new Date(),
  random: () => number = Math.random,
): WordBuilderSession {
  const startedAt = now()
  const selectedQuestions = selectUniqueQuestions(questions, 5, random)
  const firstQuestion = selectedQuestions[0]
  if (!firstQuestion) throw new Error('最初の問題が見つかりません')

  return {
    id: `word-builder-${startedAt.getTime()}-${selectedQuestions.map((question) => question.id).join('-')}`,
    questions: selectedQuestions,
    currentIndex: 0,
    tiles: createWordTiles(firstQuestion, random),
    selectedTileIds: [],
    feedback: 'none',
    startedAt: startedAt.toISOString(),
  }
}

export function selectTile(session: WordBuilderSession, tileId: string): WordBuilderSession {
  if (isWordBuilderComplete(session)) throw new Error('完了したセッションには入力できません')
  if (session.feedback === 'correct') throw new Error('正解した問題には入力できません')
  if (session.selectedTileIds.includes(tileId)) throw new Error('選択済みの文字です')
  if (!session.tiles.some((tile) => tile.id === tileId)) throw new Error('無効な文字タイルです')
  if (session.selectedTileIds.length >= currentReadingLength(session)) throw new Error('文字が多すぎます')

  return {
    ...session,
    selectedTileIds: [...session.selectedTileIds, tileId],
    feedback: 'none',
  }
}

export function undoLastTile(session: WordBuilderSession): WordBuilderSession {
  if (isWordBuilderComplete(session)) throw new Error('完了したセッションは変更できません')
  if (session.feedback === 'correct') throw new Error('正解した問題は変更できません')

  return {
    ...session,
    selectedTileIds: session.selectedTileIds.slice(0, -1),
    feedback: 'none',
  }
}

export function submitWord(session: WordBuilderSession): WordBuilderSession {
  if (isWordBuilderComplete(session)) throw new Error('完了したセッションには回答できません')
  const question = currentQuestion(session)
  if (session.selectedTileIds.length !== Array.from(question.reading).length) {
    throw new Error('すべての文字を選んでください')
  }

  const selectedReading = session.selectedTileIds
    .map((selectedId) => session.tiles.find((tile) => tile.id === selectedId)?.character)

  if (selectedReading.some((character) => character === undefined)) {
    throw new Error('選択した文字タイルが見つかりません')
  }

  return {
    ...session,
    feedback: selectedReading.join('') === question.reading ? 'correct' : 'incorrect',
  }
}

export function nextWord(session: WordBuilderSession): WordBuilderSession {
  if (session.feedback !== 'correct') throw new Error('正解した問題だけ次へ進めます')

  const nextIndex = session.currentIndex + 1
  if (nextIndex >= session.questions.length) {
    return {
      ...session,
      currentIndex: session.questions.length,
      tiles: [],
      selectedTileIds: [],
      feedback: 'none',
    }
  }

  const nextQuestion = session.questions[nextIndex]
  if (!nextQuestion) throw new Error('次の問題が見つかりません')

  return {
    ...session,
    currentIndex: nextIndex,
    tiles: createWordTiles(nextQuestion),
    selectedTileIds: [],
    feedback: 'none',
  }
}

export function isWordBuilderComplete(session: WordBuilderSession): boolean {
  return session.currentIndex >= session.questions.length
}
