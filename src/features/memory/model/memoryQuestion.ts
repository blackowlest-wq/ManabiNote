import type { KanaToPictureQuestion } from '../../question-types/kana-to-picture/model/types'
import { QuestionDataError } from '../../question-types/kana-to-picture/model/validator'
import { selectUniqueQuestions } from '../../quiz/model/questionSelection'
import type { MemoryPair } from './types'

export const MEMORY_PAIR_COUNT = 4

export function createMemoryPairs(
  questions: readonly KanaToPictureQuestion[],
  random: () => number = Math.random,
): MemoryPair[] {
  return selectUniqueQuestions(questions, MEMORY_PAIR_COUNT, random).map((question) => {
    const correctChoice = question.choices.find((choice) => choice.id === question.correctChoiceId)
    if (!correctChoice) throw new QuestionDataError()

    return {
      id: question.id,
      kana: question.kana,
      word: correctChoice.label,
      image: correctChoice.image,
    }
  })
}
