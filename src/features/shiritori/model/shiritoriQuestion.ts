import type { KanaToPictureQuestion } from '../../question-types/kana-to-picture/model/types'
import { QuestionDataError } from '../../question-types/kana-to-picture/model/validator'
import type { ShiritoriChoice, ShiritoriQuestion } from './types'

type WordEntry = {
  id: string
  label: string
  reading: string
  image: ShiritoriChoice['image']
}

const shuffle = <T,>(items: readonly T[], random: () => number): T[] => {
  const shuffled = [...items]
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1))
    ;[shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]]
  }
  return shuffled
}

const getWordEntries = (questions: readonly KanaToPictureQuestion[]): WordEntry[] => {
  const entries = new Map<string, WordEntry>()
  for (const question of questions) {
    const correctChoice = question.choices.find((choice) => choice.id === question.correctChoiceId)
    if (!correctChoice) throw new QuestionDataError()
    if (!entries.has(correctChoice.reading)) {
      entries.set(correctChoice.reading, {
        id: question.id,
        label: correctChoice.label,
        reading: correctChoice.reading,
        image: correctChoice.image,
      })
    }
  }
  return [...entries.values()]
}

export function createShiritoriQuestions(
  questions: readonly KanaToPictureQuestion[],
  random: () => number = Math.random,
): ShiritoriQuestion[] {
  const entries = getWordEntries(questions)
  if (entries.length < 4) throw new QuestionDataError()

  return entries.flatMap((previous) => {
    const previousSound = previous.reading.slice(-1)
    const nextWords = entries.filter((candidate) => (
      candidate.id !== previous.id && candidate.reading.startsWith(previousSound)
    ))
    if (nextWords.length === 0) return []

    const correctWord = nextWords[Math.floor(random() * nextWords.length)]
    if (!correctWord) throw new QuestionDataError()
    const distractors = shuffle(
      entries.filter((candidate) => (
        candidate.id !== correctWord.id &&
        candidate.id !== previous.id &&
        !candidate.reading.startsWith(previousSound)
      )),
      random,
    ).slice(0, 3)
    if (distractors.length !== 3) throw new QuestionDataError()

    const choiceEntries = shuffle([correctWord, ...distractors], random)
    const choices = choiceEntries.map((choice, index) => ({
      id: `shiritori-${previous.id}-choice-${index}`,
      label: choice.label,
      reading: choice.reading,
      image: choice.image,
    }))
    const correctChoice = choices.find((choice) => choice.reading === correctWord.reading)
    if (!correctChoice) throw new QuestionDataError()

    return [{
      id: `shiritori-${previous.id}`,
      previousWord: previous.label,
      previousReading: previous.reading,
      previousImage: previous.image,
      choices,
      correctChoiceId: correctChoice.id,
    }]
  })
}
