import type { KanaToPictureQuestion } from '../../question-types/kana-to-picture/model/types'
import { QuestionDataError } from '../../question-types/kana-to-picture/model/validator'
import type { CountingQuestion } from './types'

const COUNT_CHOICES = [1, 2, 3, 4, 5] as const

const shuffle = <T,>(items: readonly T[], random: () => number): T[] => {
  const shuffled = [...items]
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1))
    ;[shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]]
  }
  return shuffled
}

export function createCountingQuestions(
  questions: readonly KanaToPictureQuestion[],
  random: () => number = Math.random,
): CountingQuestion[] {
  const uniqueItems = new Map<string, { id: string; label: string; image: CountingQuestion['image'] }>()
  for (const question of questions) {
    const correctChoice = question.choices.find((choice) => choice.id === question.correctChoiceId)
    if (!correctChoice) throw new QuestionDataError()
    if (!uniqueItems.has(correctChoice.reading)) {
      uniqueItems.set(correctChoice.reading, {
        id: question.id,
        label: correctChoice.label,
        image: correctChoice.image,
      })
    }
  }

  return [...uniqueItems.values()].map((item, index) => {
    const count = (index % COUNT_CHOICES.length) + 1
    const choices = shuffle(COUNT_CHOICES, random).map((choice, choiceIndex) => ({
      id: `counting-${item.id}-choice-${choiceIndex}`,
      count: choice,
    }))
    const correctChoice = choices.find((choice) => choice.count === count)
    if (!correctChoice) throw new QuestionDataError()

    return {
      id: `counting-${item.id}`,
      label: item.label,
      image: item.image,
      count,
      choices,
      correctChoiceId: correctChoice.id,
    }
  })
}
