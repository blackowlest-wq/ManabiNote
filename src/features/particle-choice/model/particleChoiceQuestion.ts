import { QuestionDataError } from '../../question-types/kana-to-picture/model/validator'
import type { ParticleChoiceQuestion } from './types'

type ParticleChoiceSource = {
  id: string
  before: string
  after: string
  answer: string
  choices: readonly string[]
}

const QUESTION_SOURCES: readonly ParticleChoiceSource[] = [
  { id: 'particle-pan', before: 'パン', after: 'たべます', answer: 'を', choices: ['を', 'に', 'で', 'と'] },
  { id: 'particle-gakkou', before: 'がっこう', after: 'いきます', answer: 'に', choices: ['に', 'を', 'で', 'が'] },
  { id: 'particle-kouen', before: 'こうえん', after: 'あそびます', answer: 'で', choices: ['で', 'を', 'に', 'と'] },
  { id: 'particle-watashi', before: 'わたし', after: 'しょうがくせいです', answer: 'は', choices: ['は', 'を', 'に', 'で'] },
  { id: 'particle-tsukue', before: 'つくえの うえ', after: 'ほんが あります', answer: 'に', choices: ['に', 'を', 'で', 'と'] },
  { id: 'particle-kureyon', before: 'クレヨン', after: 'えを かきます', answer: 'で', choices: ['で', 'を', 'に', 'は'] },
  { id: 'particle-inu', before: 'いぬ', after: 'はしっています', answer: 'が', choices: ['が', 'を', 'に', 'で'] },
  { id: 'particle-otouto', before: 'おとうと', after: 'いっしょに あそびます', answer: 'と', choices: ['と', 'を', 'に', 'で'] },
  { id: 'particle-mizu', before: 'みず', after: 'のみます', answer: 'を', choices: ['を', 'に', 'で', 'と'] },
  { id: 'particle-isu', before: 'いす', after: 'すわります', answer: 'に', choices: ['に', 'を', 'で', 'が'] },
  { id: 'particle-hasami', before: 'はさみ', after: 'かみを きります', answer: 'で', choices: ['で', 'を', 'に', 'と'] },
  { id: 'particle-tomodachi', before: 'ともだち', after: 'はなします', answer: 'と', choices: ['と', 'を', 'に', 'で'] },
  { id: 'particle-neko', before: 'ねこ', after: 'へやに います', answer: 'が', choices: ['が', 'を', 'に', 'で'] },
  { id: 'particle-kyou', before: 'きょう', after: 'はれです', answer: 'は', choices: ['は', 'を', 'に', 'で'] },
  { id: 'particle-hako', before: 'はこ', after: 'おもちゃを いれます', answer: 'に', choices: ['に', 'を', 'で', 'と'] },
]

const shuffle = <T,>(items: readonly T[], random: () => number): T[] => {
  const shuffled = [...items]
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1))
    ;[shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]]
  }
  return shuffled
}

export function createParticleChoiceQuestions(random: () => number = Math.random): ParticleChoiceQuestion[] {
  return QUESTION_SOURCES.map((source) => {
    if (!source.before || !source.after || source.choices.length !== 4 || new Set(source.choices).size !== 4 || !source.choices.includes(source.answer)) {
      throw new QuestionDataError()
    }

    const choices = shuffle(source.choices, random).map((particle, index) => ({
      id: `${source.id}-choice-${index}`,
      particle,
    }))
    const correctChoice = choices.find((choice) => choice.particle === source.answer)
    if (!correctChoice) throw new QuestionDataError()

    return {
      id: source.id,
      before: source.before,
      after: source.after,
      answer: source.answer,
      choices,
      correctChoiceId: correctChoice.id,
    }
  })
}

export function getMaskedParticleSentence(question: ParticleChoiceQuestion): string {
  return `${question.before} ＿ ${question.after}`
}
