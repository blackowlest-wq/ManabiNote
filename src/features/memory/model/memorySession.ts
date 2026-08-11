import type { KanaToPictureQuestion } from '../../question-types/kana-to-picture/model/types'
import { createMemoryPairs } from './memoryQuestion'
import type { MemoryCard, MemoryPair } from './types'

export type MemoryFeedback = 'none' | 'incorrect' | 'correct'
export type MemoryStatus = 'playing' | 'complete'

export type MemorySession = {
  id: string
  pairs: readonly MemoryPair[]
  cards: readonly MemoryCard[]
  flippedCardIds: readonly string[]
  matchedPairIds: readonly string[]
  feedback: MemoryFeedback
  moves: number
  status: MemoryStatus
  startedAt: string
}

const shuffle = <T,>(items: readonly T[], random: () => number): T[] => {
  const shuffled = [...items]
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1))
    ;[shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]]
  }
  return shuffled
}

const findCard = (session: MemorySession, cardId: string): MemoryCard => {
  const card = session.cards.find((candidate) => candidate.id === cardId)
  if (!card) throw new Error('カードが見つかりません')
  return card
}

export function createMemorySession(
  questions: readonly KanaToPictureQuestion[],
  now: () => Date = () => new Date(),
  random: () => number = Math.random,
): MemorySession {
  const startedAt = now()
  const pairs = createMemoryPairs(questions, random)
  const cards = shuffle(
    pairs.flatMap((pair) => [
      { id: `${pair.id}-kana`, pairId: pair.id, kind: 'kana' as const, character: pair.kana },
      { id: `${pair.id}-picture`, pairId: pair.id, kind: 'picture' as const, label: pair.word, image: pair.image },
    ]),
    random,
  )

  return {
    id: `memory-${startedAt.getTime()}-${pairs.map((pair) => pair.id).join('-')}`,
    pairs,
    cards,
    flippedCardIds: [],
    matchedPairIds: [],
    feedback: 'none',
    moves: 0,
    status: 'playing',
    startedAt: startedAt.toISOString(),
  }
}

export function flipMemoryCard(session: MemorySession, cardId: string): MemorySession {
  if (isMemoryComplete(session)) throw new Error('完了したゲームには回答できません')

  const card = findCard(session, cardId)
  if (session.matchedPairIds.includes(card.pairId)) throw new Error('そろったカードは選べません')
  if (session.flippedCardIds.includes(cardId)) return session

  if (session.flippedCardIds.length >= 2) {
    if (session.feedback !== 'incorrect') throw new Error('次のカードを選べません')
    return {
      ...session,
      flippedCardIds: [cardId],
      feedback: 'none',
    }
  }

  const flippedCardIds = [...session.flippedCardIds, cardId]
  if (flippedCardIds.length === 1) {
    return {
      ...session,
      flippedCardIds,
      feedback: 'none',
    }
  }

  const firstCard = findCard(session, flippedCardIds[0] ?? '')
  const isMatch = firstCard.pairId === card.pairId
  const moves = session.moves + 1
  if (isMatch) {
    const matchedPairIds = [...session.matchedPairIds, card.pairId]
    const isComplete = matchedPairIds.length === session.pairs.length
    return {
      ...session,
      flippedCardIds: [],
      matchedPairIds,
      feedback: 'correct',
      moves,
      status: isComplete ? 'complete' : 'playing',
    }
  }

  return {
    ...session,
    flippedCardIds,
    feedback: 'incorrect',
    moves,
  }
}

export function isMemoryComplete(session: MemorySession): boolean {
  return session.status === 'complete'
}
