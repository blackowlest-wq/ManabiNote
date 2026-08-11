import { QuestionDataError } from '../../question-types/kana-to-picture/model/validator'
import type { KanaPairQuestion } from './types'

export const HIRAGANA_CHARACTERS = Array.from('あいうえおかきくけこさしすせそたちつてとなにぬねのはひふへほまみむめもやゆよらりるれろわをん')

const KATAKANA_CHARACTERS = HIRAGANA_CHARACTERS.map(toKatakana)

const shuffle = <T,>(items: readonly T[], random: () => number): T[] => {
  const shuffled = [...items]
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1))
    ;[shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]]
  }
  return shuffled
}

export function toKatakana(hiragana: string): string {
  const codePoint = hiragana.codePointAt(0)
  if (codePoint === undefined || codePoint < 0x3041 || codePoint > 0x3096) {
    throw new QuestionDataError()
  }

  return String.fromCodePoint(codePoint + 0x60)
}

export function createKanaPairQuestions(
  random: () => number = Math.random,
): KanaPairQuestion[] {
  return HIRAGANA_CHARACTERS.map((hiragana, index) => {
    const katakana = toKatakana(hiragana)
    const distractors = shuffle(
      KATAKANA_CHARACTERS.filter((character) => character !== katakana),
      random,
    ).slice(0, 3)
    const choiceCharacters = shuffle([katakana, ...distractors], random)
    const choices = choiceCharacters.map((character, choiceIndex) => ({
      id: `kana-pair-${index}-choice-${choiceIndex}`,
      character,
    }))
    const correctChoice = choices.find((choice) => choice.character === katakana)
    if (!correctChoice || choices.length !== 4) throw new QuestionDataError()

    return {
      id: `kana-pair-${hiragana}`,
      hiragana,
      katakana,
      choices,
      correctChoiceId: correctChoice.id,
    }
  })
}
