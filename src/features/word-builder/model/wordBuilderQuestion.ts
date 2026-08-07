import type { KanaToPictureQuestion } from '../../question-types/kana-to-picture/model/types'
import { QuestionDataError } from '../../question-types/kana-to-picture/model/validator'
import type { WordBuilderQuestion, WordTile } from './types'

export function adaptWordBuilderQuestions(
  questions: readonly KanaToPictureQuestion[],
): WordBuilderQuestion[] {
  return questions.map((question) => {
    const correctChoice = question.choices.find((choice) => choice.id === question.correctChoiceId)
    if (!correctChoice) throw new QuestionDataError()

    return {
      id: question.id,
      reading: correctChoice.reading,
      image: correctChoice.image,
    }
  })
}

export function createWordTiles(
  question: WordBuilderQuestion,
  random: () => number = Math.random,
): WordTile[] {
  const tiles = Array.from(question.reading, (character, index) => ({
    id: `${question.id}-tile-${index}`,
    character,
  }))

  for (let index = tiles.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1))
    ;[tiles[index], tiles[swapIndex]] = [tiles[swapIndex], tiles[index]]
  }

  return tiles
}
