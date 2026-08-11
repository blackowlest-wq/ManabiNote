import { HIRAGANA_CHARACTERS } from '../../kana-pair/model/kanaPairQuestion'
import type { AudioKanaQuestion } from './types'

const shuffle = <T,>(items: readonly T[], random: () => number): T[] => {
  const shuffled = [...items]
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1))
    ;[shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]]
  }
  return shuffled
}

export function createAudioKanaQuestions(random: () => number = Math.random): AudioKanaQuestion[] {
  return HIRAGANA_CHARACTERS.map((answer, index) => {
    const distractors = shuffle(HIRAGANA_CHARACTERS.filter((character) => character !== answer), random).slice(0, 3)
    const choiceCharacters = shuffle([answer, ...distractors], random)
    const choices = choiceCharacters.map((character, choiceIndex) => ({
      id: `audio-kana-${index}-choice-${choiceIndex}`,
      character,
    }))
    const correctChoice = choices.find((choice) => choice.character === answer)
    if (!correctChoice || choices.length !== 4) throw new Error('音声問題を作成できません')

    return {
      id: `audio-kana-${answer}`,
      answer,
      choices,
      correctChoiceId: correctChoice.id,
    }
  })
}
