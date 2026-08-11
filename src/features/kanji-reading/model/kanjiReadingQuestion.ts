import { QuestionDataError } from '../../question-types/kana-to-picture/model/validator'
import type { KanjiReadingQuestion } from './types'

type KanjiReadingSource = {
  id: string
  kanji: string
  word: string
  answer: string
  choices: readonly string[]
}

const QUESTION_SOURCES: readonly KanjiReadingSource[] = [
  { id: 'kanji-yama', kanji: '山', word: '山', answer: 'やま', choices: ['やま', 'かわ', 'そら', 'はな'] },
  { id: 'kanji-kawa', kanji: '川', word: '川', answer: 'かわ', choices: ['かわ', 'やま', 'うみ', 'みず'] },
  { id: 'kanji-ki', kanji: '木', word: '木', answer: 'き', choices: ['き', 'ひ', 'つち', 'もり'] },
  { id: 'kanji-hi', kanji: '日', word: '日', answer: 'ひ', choices: ['ひ', 'つき', 'にち', 'ほし'] },
  { id: 'kanji-tsuki', kanji: '月', word: '月', answer: 'つき', choices: ['つき', 'ひ', 'そら', 'よる'] },
  { id: 'kanji-mizu', kanji: '水', word: '水', answer: 'みず', choices: ['みず', 'ひ', 'かわ', 'あめ'] },
  { id: 'kanji-hana', kanji: '花', word: '花', answer: 'はな', choices: ['はな', 'き', 'くさ', 'そら'] },
  { id: 'kanji-inu', kanji: '犬', word: '犬', answer: 'いぬ', choices: ['いぬ', 'ねこ', 'とり', 'うま'] },
  { id: 'kanji-neko', kanji: '猫', word: '猫', answer: 'ねこ', choices: ['ねこ', 'いぬ', 'とり', 'うさぎ'] },
  { id: 'kanji-sora', kanji: '空', word: '空', answer: 'そら', choices: ['そら', 'うみ', 'やま', 'くも'] },
  { id: 'kanji-ame', kanji: '雨', word: '雨', answer: 'あめ', choices: ['あめ', 'ゆき', 'かぜ', 'くも'] },
  { id: 'kanji-te', kanji: '手', word: '手', answer: 'て', choices: ['て', 'め', 'みみ', 'くち'] },
  { id: 'kanji-me', kanji: '目', word: '目', answer: 'め', choices: ['め', 'て', 'みみ', 'はな'] },
  { id: 'kanji-kuchi', kanji: '口', word: '口', answer: 'くち', choices: ['くち', 'て', 'め', 'みみ'] },
  { id: 'kanji-mimi', kanji: '耳', word: '耳', answer: 'みみ', choices: ['みみ', 'め', 'はな', 'くち'] },
]

const shuffle = <T,>(items: readonly T[], random: () => number): T[] => {
  const shuffled = [...items]
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1))
    ;[shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]]
  }
  return shuffled
}

export function createKanjiReadingQuestions(random: () => number = Math.random): KanjiReadingQuestion[] {
  return QUESTION_SOURCES.map((source) => {
    if (source.kanji.length !== 1 || !source.word.includes(source.kanji) || source.choices.length !== 4 || !source.choices.includes(source.answer)) {
      throw new QuestionDataError()
    }

    const choices = shuffle(source.choices, random).map((reading, index) => ({
      id: `${source.id}-choice-${index}`,
      reading,
    }))
    const correctChoice = choices.find((choice) => choice.reading === source.answer)
    if (!correctChoice) throw new QuestionDataError()

    return {
      id: source.id,
      kanji: source.kanji,
      word: source.word,
      answer: source.answer,
      choices,
      correctChoiceId: correctChoice.id,
    }
  })
}
