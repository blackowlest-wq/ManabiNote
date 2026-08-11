import { QuestionDataError } from '../../question-types/kana-to-picture/model/validator'
import type { SentenceOrderQuestion } from './types'

type SentenceOrderSource = {
  id: string
  sentence: string
  words: readonly string[]
}

const QUESTION_SOURCES: readonly SentenceOrderSource[] = [
  { id: 'sentence-order-ringo', sentence: 'わたしは りんごを たべます', words: ['わたしは', 'りんごを', 'たべます'] },
  { id: 'sentence-order-hon', sentence: 'おとうさんが ほんを よみます', words: ['おとうさんが', 'ほんを', 'よみます'] },
  { id: 'sentence-order-tori', sentence: 'とりが そらを とびます', words: ['とりが', 'そらを', 'とびます'] },
  { id: 'sentence-order-kuruma', sentence: 'あかい くるまが はしります', words: ['あかい', 'くるまが', 'はしります'] },
  { id: 'sentence-order-ame', sentence: 'きょうは あめが ふります', words: ['きょうは', 'あめが', 'ふります'] },
  { id: 'sentence-order-mizu', sentence: 'みずを のみます', words: ['みずを', 'のみます'] },
  { id: 'sentence-order-hana', sentence: 'はなが さいています', words: ['はなが', 'さいています'] },
]

const shuffle = <T,>(items: readonly T[], random: () => number): T[] => {
  const shuffled = [...items]
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1))
    ;[shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]]
  }
  return shuffled
}

export function createSentenceOrderQuestions(random: () => number = Math.random): SentenceOrderQuestion[] {
  return QUESTION_SOURCES.map((source) => {
    if (source.words.length < 2 || source.sentence !== source.words.join(' ')) throw new QuestionDataError()

    const choices = shuffle(source.words, random).map((word, index) => ({
      id: `${source.id}-choice-${index}`,
      word,
    }))
    const correctChoiceIds = source.words.map((word) => choices.find((choice) => choice.word === word)?.id)
    if (correctChoiceIds.some((choiceId) => !choiceId)) throw new QuestionDataError()

    return {
      id: source.id,
      sentence: source.sentence,
      words: source.words,
      choices,
      correctChoiceIds: correctChoiceIds as string[],
    }
  })
}
