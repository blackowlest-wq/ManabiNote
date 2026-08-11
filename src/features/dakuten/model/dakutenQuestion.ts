import type { DakutenMark, DakutenQuestion } from './types'

type DakutenPair = {
  baseCharacter: string
  mark: DakutenMark
  answer: string
}

const DAKUTEN_PAIRS: readonly DakutenPair[] = [
  { baseCharacter: 'か', mark: '゛', answer: 'が' },
  { baseCharacter: 'き', mark: '゛', answer: 'ぎ' },
  { baseCharacter: 'く', mark: '゛', answer: 'ぐ' },
  { baseCharacter: 'け', mark: '゛', answer: 'げ' },
  { baseCharacter: 'こ', mark: '゛', answer: 'ご' },
  { baseCharacter: 'さ', mark: '゛', answer: 'ざ' },
  { baseCharacter: 'し', mark: '゛', answer: 'じ' },
  { baseCharacter: 'す', mark: '゛', answer: 'ず' },
  { baseCharacter: 'せ', mark: '゛', answer: 'ぜ' },
  { baseCharacter: 'そ', mark: '゛', answer: 'ぞ' },
  { baseCharacter: 'た', mark: '゛', answer: 'だ' },
  { baseCharacter: 'ち', mark: '゛', answer: 'ぢ' },
  { baseCharacter: 'つ', mark: '゛', answer: 'づ' },
  { baseCharacter: 'て', mark: '゛', answer: 'で' },
  { baseCharacter: 'と', mark: '゛', answer: 'ど' },
  { baseCharacter: 'は', mark: '゛', answer: 'ば' },
  { baseCharacter: 'ひ', mark: '゛', answer: 'び' },
  { baseCharacter: 'ふ', mark: '゛', answer: 'ぶ' },
  { baseCharacter: 'へ', mark: '゛', answer: 'べ' },
  { baseCharacter: 'ほ', mark: '゛', answer: 'ぼ' },
  { baseCharacter: 'は', mark: '゜', answer: 'ぱ' },
  { baseCharacter: 'ひ', mark: '゜', answer: 'ぴ' },
  { baseCharacter: 'ふ', mark: '゜', answer: 'ぷ' },
  { baseCharacter: 'へ', mark: '゜', answer: 'ぺ' },
  { baseCharacter: 'ほ', mark: '゜', answer: 'ぽ' },
]

const ANSWERS = DAKUTEN_PAIRS.map((pair) => pair.answer)

const shuffle = <T,>(items: readonly T[], random: () => number): T[] => {
  const shuffled = [...items]
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1))
    ;[shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]]
  }
  return shuffled
}

export function createDakutenQuestions(random: () => number = Math.random): DakutenQuestion[] {
  return DAKUTEN_PAIRS.map((pair, index) => {
    const distractors = shuffle(ANSWERS.filter((answer) => answer !== pair.answer), random).slice(0, 3)
    const choiceCharacters = shuffle([pair.answer, ...distractors], random)
    const choices = choiceCharacters.map((character, choiceIndex) => ({
      id: `dakuten-${index}-choice-${choiceIndex}`,
      character,
    }))
    const correctChoice = choices.find((choice) => choice.character === pair.answer)
    if (!correctChoice || choices.length !== 4) throw new Error('濁点問題を作成できません')

    return {
      id: `dakuten-${pair.baseCharacter}-${pair.mark}`,
      ...pair,
      choices,
      correctChoiceId: correctChoice.id,
    }
  })
}
