import type { KanaToPictureQuestion } from '../../question-types/kana-to-picture/model/types'
import { QuestionDataError } from '../../question-types/kana-to-picture/model/validator'
import type { MissingCharacterQuestion } from './types'

const CHARACTER_POOL = Array.from('あいうえおかきくけこさしすせそたちつてとなにぬねのはひふへほまみむめもやゆよらりるれろわをんっー')

type MissingCharacterSource = {
  id: string
  reading: string
  image: MissingCharacterQuestion['image']
}

const shuffle = <T,>(items: readonly T[], random: () => number): T[] => {
  const shuffled = [...items]
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1))
    ;[shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]]
  }
  return shuffled
}

export function createMissingCharacterQuestion(
  source: MissingCharacterSource,
  random: () => number = Math.random,
): MissingCharacterQuestion {
  const characters = Array.from(source.reading)
  if (characters.length === 0) throw new QuestionDataError()

  const missingIndex = Math.floor(random() * characters.length)
  const correctCharacter = characters[missingIndex]
  if (!correctCharacter) throw new QuestionDataError()

  const distractors = shuffle(
    CHARACTER_POOL.filter((character) => character !== correctCharacter),
    random,
  ).slice(0, 3)
  const choiceCharacters = shuffle([correctCharacter, ...distractors], random)
  const choices = choiceCharacters.map((character, index) => ({
    id: `${source.id}-missing-choice-${index}`,
    character,
  }))
  const correctChoice = choices.find((choice) => choice.character === correctCharacter)
  if (!correctChoice || choices.length !== 4) throw new QuestionDataError()

  return {
    id: source.id,
    reading: source.reading,
    image: source.image,
    missingIndex,
    correctCharacter,
    choices,
    correctChoiceId: correctChoice.id,
  }
}

export function adaptMissingCharacterQuestions(
  questions: readonly KanaToPictureQuestion[],
  random: () => number = Math.random,
): MissingCharacterQuestion[] {
  return questions.map((question) => {
    const correctChoice = question.choices.find((choice) => choice.id === question.correctChoiceId)
    if (!correctChoice) throw new QuestionDataError()

    return createMissingCharacterQuestion({
      id: question.id,
      reading: correctChoice.reading,
      image: correctChoice.image,
    }, random)
  })
}

export function getMaskedReading(question: MissingCharacterQuestion): string {
  return Array.from(question.reading)
    .map((character, index) => index === question.missingIndex ? '＿' : character)
    .join('')
}
