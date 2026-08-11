import { QuestionDataError } from '../../question-types/kana-to-picture/model/validator'
import type { GameDifficulty } from '../../../shared/gameDifficulty'
import type { SentenceOrderQuestion } from './types'

type SentenceOrderSource = {
  id: string
  difficulty: GameDifficulty
  sentence: string
  words: readonly string[]
}

const QUESTION_SOURCES: readonly SentenceOrderSource[] = [
  { id: 'sentence-order-mizu', difficulty: 'easy', sentence: 'みずを のみます', words: ['みずを', 'のみます'] },
  { id: 'sentence-order-hana', difficulty: 'easy', sentence: 'はなが さきます', words: ['はなが', 'さきます'] },
  { id: 'sentence-order-inu', difficulty: 'easy', sentence: 'いぬが はしります', words: ['いぬが', 'はしります'] },
  { id: 'sentence-order-neko', difficulty: 'easy', sentence: 'ねこが ねます', words: ['ねこが', 'ねます'] },
  { id: 'sentence-order-book', difficulty: 'easy', sentence: 'ほんを よみます', words: ['ほんを', 'よみます'] },
  { id: 'sentence-order-song', difficulty: 'easy', sentence: 'うたを うたいます', words: ['うたを', 'うたいます'] },
  { id: 'sentence-order-rain', difficulty: 'easy', sentence: 'あめが ふります', words: ['あめが', 'ふります'] },
  { id: 'sentence-order-ringo', difficulty: 'normal', sentence: 'わたしは りんごを たべます', words: ['わたしは', 'りんごを', 'たべます'] },
  { id: 'sentence-order-hon', difficulty: 'normal', sentence: 'おとうさんが ほんを よみます', words: ['おとうさんが', 'ほんを', 'よみます'] },
  { id: 'sentence-order-tori', difficulty: 'normal', sentence: 'とりが そらを とびます', words: ['とりが', 'そらを', 'とびます'] },
  { id: 'sentence-order-kuruma', difficulty: 'normal', sentence: 'あかい くるまが はしります', words: ['あかい', 'くるまが', 'はしります'] },
  { id: 'sentence-order-ame', difficulty: 'normal', sentence: 'きょうは あめが ふります', words: ['きょうは', 'あめが', 'ふります'] },
  { id: 'sentence-order-school', difficulty: 'normal', sentence: 'あしたは がっこうへ いきます', words: ['あしたは', 'がっこうへ', 'いきます'] },
  { id: 'sentence-order-friend', difficulty: 'normal', sentence: 'ともだちと こうえんで あそびます', words: ['ともだちと', 'こうえんで', 'あそびます'] },
  { id: 'sentence-order-morning', difficulty: 'hard', sentence: 'あさ おきたら かおを あらいます', words: ['あさ', 'おきたら', 'かおを', 'あらいます'] },
  { id: 'sentence-order-park', difficulty: 'hard', sentence: 'こうえんで ともだちと げんきに あそびます', words: ['こうえんで', 'ともだちと', 'げんきに', 'あそびます'] },
  { id: 'sentence-order-dinner', difficulty: 'hard', sentence: 'おかあさんが だいどころで ばんごはんを つくります', words: ['おかあさんが', 'だいどころで', 'ばんごはんを', 'つくります'] },
  { id: 'sentence-order-zoo', difficulty: 'hard', sentence: 'きのう かぞくで どうぶつえんへ いきました', words: ['きのう', 'かぞくで', 'どうぶつえんへ', 'いきました'] },
  { id: 'sentence-order-umbrella', difficulty: 'hard', sentence: 'あめが ふったので かさを もって でかけました', words: ['あめが', 'ふったので', 'かさを', 'もって', 'でかけました'] },
  { id: 'sentence-order-snow', difficulty: 'hard', sentence: 'あたたかい ひざしで ゆきが すこしずつ とけました', words: ['あたたかい', 'ひざしで', 'ゆきが', 'すこしずつ', 'とけました'] },
  { id: 'sentence-order-library', difficulty: 'hard', sentence: 'としょかんで すきな ものがたりを しずかに よみます', words: ['としょかんで', 'すきな', 'ものがたりを', 'しずかに', 'よみます'] },
]

const shuffle = <T,>(items: readonly T[], random: () => number): T[] => {
  const shuffled = [...items]
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1))
    ;[shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]]
  }
  return shuffled
}

export function createSentenceOrderQuestions(
  difficulty: GameDifficulty = 'normal',
  random: () => number = Math.random,
): SentenceOrderQuestion[] {
  return QUESTION_SOURCES.filter((source) => source.difficulty === difficulty).map((source) => {
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
