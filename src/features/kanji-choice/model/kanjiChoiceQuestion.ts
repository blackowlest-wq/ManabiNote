import { QuestionDataError } from '../../question-types/kana-to-picture/model/validator'
import type { KanjiChoiceQuestion } from './types'

type KanjiChoiceSource = {
  id: string
  reading: string
  answer: string
  choices: readonly string[]
}

const QUESTION_SOURCES: readonly KanjiChoiceSource[] = [
  { id: 'kanji-choice-yama', reading: 'やま', answer: '山', choices: ['山', '川', '空', '花'] },
  { id: 'kanji-choice-kawa', reading: 'かわ', answer: '川', choices: ['川', '山', '水', '雨'] },
  { id: 'kanji-choice-ki', reading: 'き', answer: '木', choices: ['木', '日', '月', '火'] },
  { id: 'kanji-choice-hi', reading: 'ひ', answer: '日', choices: ['日', '月', '火', '水'] },
  { id: 'kanji-choice-tsuki', reading: 'つき', answer: '月', choices: ['月', '日', '空', '雨'] },
  { id: 'kanji-choice-mizu', reading: 'みず', answer: '水', choices: ['水', '川', '雨', '火'] },
  { id: 'kanji-choice-hana', reading: 'はな', answer: '花', choices: ['花', '木', '山', '空'] },
  { id: 'kanji-choice-inu', reading: 'いぬ', answer: '犬', choices: ['犬', '猫', '鳥', '馬'] },
  { id: 'kanji-choice-neko', reading: 'ねこ', answer: '猫', choices: ['猫', '犬', '鳥', '馬'] },
  { id: 'kanji-choice-sora', reading: 'そら', answer: '空', choices: ['空', '山', '川', '雨'] },
  { id: 'kanji-choice-ame', reading: 'あめ', answer: '雨', choices: ['雨', '水', '空', '川'] },
  { id: 'kanji-choice-te', reading: 'て', answer: '手', choices: ['手', '目', '耳', '口'] },
  { id: 'kanji-choice-me', reading: 'め', answer: '目', choices: ['目', '手', '耳', '口'] },
  { id: 'kanji-choice-kuchi', reading: 'くち', answer: '口', choices: ['口', '手', '目', '耳'] },
  { id: 'kanji-choice-mimi', reading: 'みみ', answer: '耳', choices: ['耳', '目', '手', '口'] },
]

const shuffle = <T,>(items: readonly T[], random: () => number): T[] => {
  const shuffled = [...items]
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1))
    ;[shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]]
  }
  return shuffled
}

export function createKanjiChoiceQuestions(random: () => number = Math.random): KanjiChoiceQuestion[] {
  return QUESTION_SOURCES.map((source) => {
    if (!source.reading || source.answer.length !== 1 || source.choices.length !== 4 || new Set(source.choices).size !== 4 || !source.choices.includes(source.answer)) {
      throw new QuestionDataError()
    }

    const choices = shuffle(source.choices, random).map((kanji, index) => ({
      id: `${source.id}-choice-${index}`,
      kanji,
    }))
    const correctChoice = choices.find((choice) => choice.kanji === source.answer)
    if (!correctChoice) throw new QuestionDataError()

    return {
      id: source.id,
      reading: source.reading,
      answer: source.answer,
      choices,
      correctChoiceId: correctChoice.id,
    }
  })
}
