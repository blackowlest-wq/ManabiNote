import { QuestionDataError } from '../../question-types/kana-to-picture/model/validator'
import type { SmallKanaQuestion } from './types'

type SmallKanaQuestionSource = {
  id: string
  word: string
  answer: string
  choices: readonly string[]
}

const QUESTION_SOURCES: readonly SmallKanaQuestionSource[] = [
  { id: 'small-kana-kyaku', word: 'きゃく', answer: 'ゃ', choices: ['ゃ', 'や', 'ゅ', 'ょ'] },
  { id: 'small-kana-kyuuri', word: 'きゅうり', answer: 'ゅ', choices: ['ゅ', 'ゆ', 'ゃ', 'ょ'] },
  { id: 'small-kana-kyouryuu', word: 'きょうりゅう', answer: 'ょ', choices: ['ょ', 'よ', 'ゃ', 'ゅ'] },
  { id: 'small-kana-shashin', word: 'しゃしん', answer: 'ゃ', choices: ['ゃ', 'や', 'ゅ', 'ょ'] },
  { id: 'small-kana-shukudai', word: 'しゅくだい', answer: 'ゅ', choices: ['ゅ', 'ゆ', 'ゃ', 'ょ'] },
  { id: 'small-kana-shoubousha', word: 'しょうぼうしゃ', answer: 'ょ', choices: ['ょ', 'よ', 'ゃ', 'ゅ'] },
  { id: 'small-kana-chawan', word: 'ちゃわん', answer: 'ゃ', choices: ['ゃ', 'や', 'ゅ', 'ょ'] },
  { id: 'small-kana-chuurippu', word: 'ちゅーりっぷ', answer: 'ゅ', choices: ['ゅ', 'ゆ', 'ゃ', 'ょ'] },
  { id: 'small-kana-chouchou', word: 'ちょうちょ', answer: 'ょ', choices: ['ょ', 'よ', 'ゃ', 'ゅ'] },
  { id: 'small-kana-nyuuen', word: 'にゅうえん', answer: 'ゅ', choices: ['ゅ', 'ゆ', 'ゃ', 'ょ'] },
  { id: 'small-kana-hyaku', word: 'ひゃく', answer: 'ゃ', choices: ['ゃ', 'や', 'ゅ', 'ょ'] },
  { id: 'small-kana-hyoutan', word: 'ひょうたん', answer: 'ょ', choices: ['ょ', 'よ', 'ゃ', 'ゅ'] },
  { id: 'small-kana-ryokou', word: 'りょこう', answer: 'ょ', choices: ['ょ', 'よ', 'ゃ', 'ゅ'] },
  { id: 'small-kana-ryuu', word: 'りゅう', answer: 'ゅ', choices: ['ゅ', 'ゆ', 'ゃ', 'ょ'] },
  { id: 'small-kana-kitte', word: 'きって', answer: 'っ', choices: ['っ', 'つ', 'ゃ', 'ょ'] },
  { id: 'small-kana-gakkou', word: 'がっこう', answer: 'っ', choices: ['っ', 'つ', 'ゃ', 'ょ'] },
  { id: 'small-kana-zasshi', word: 'ざっし', answer: 'っ', choices: ['っ', 'つ', 'ゃ', 'ょ'] },
  { id: 'small-kana-koppu', word: 'こっぷ', answer: 'っ', choices: ['っ', 'つ', 'ゃ', 'ょ'] },
]

const shuffle = <T,>(items: readonly T[], random: () => number): T[] => {
  const shuffled = [...items]
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1))
    ;[shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]]
  }
  return shuffled
}

export function createSmallKanaQuestions(random: () => number = Math.random): SmallKanaQuestion[] {
  return QUESTION_SOURCES.map((source) => {
    if (!source.word.includes(source.answer) || source.choices.length !== 4 || !source.choices.includes(source.answer)) {
      throw new QuestionDataError()
    }

    const choices = shuffle(source.choices, random).map((character, index) => ({
      id: `${source.id}-choice-${index}`,
      character,
    }))
    const correctChoice = choices.find((choice) => choice.character === source.answer)
    if (!correctChoice) throw new QuestionDataError()

    return {
      id: source.id,
      word: source.word,
      answer: source.answer,
      choices,
      correctChoiceId: correctChoice.id,
    }
  })
}

export function getMaskedSmallKanaWord(question: SmallKanaQuestion): string {
  const answerIndex = question.word.indexOf(question.answer)
  if (answerIndex < 0) throw new QuestionDataError()
  return `${question.word.slice(0, answerIndex)}＿${question.word.slice(answerIndex + question.answer.length)}`
}
