import { QuestionDataError } from '../../question-types/kana-to-picture/model/validator'
import type { GameDifficulty } from '../../../shared/gameDifficulty'
import type { ParticleChoiceQuestion } from './types'

type ParticleChoiceSource = {
  id: string
  difficulty: GameDifficulty
  before: string
  after: string
  answer: string
  choices: readonly string[]
}

const QUESTION_SOURCES: readonly ParticleChoiceSource[] = [
  { id: 'particle-pan', difficulty: 'easy', before: 'パン', after: 'たべます', answer: 'を', choices: ['を', 'に', 'で', 'と'] },
  { id: 'particle-gakkou', difficulty: 'easy', before: 'がっこう', after: 'いきます', answer: 'に', choices: ['に', 'を', 'で', 'が'] },
  { id: 'particle-watashi', difficulty: 'easy', before: 'わたし', after: 'しょうがくせいです', answer: 'は', choices: ['は', 'を', 'に', 'で'] },
  { id: 'particle-mizu', difficulty: 'easy', before: 'みず', after: 'のみます', answer: 'を', choices: ['を', 'に', 'で', 'と'] },
  { id: 'particle-isu', difficulty: 'easy', before: 'いす', after: 'すわります', answer: 'に', choices: ['に', 'を', 'で', 'が'] },
  { id: 'particle-kyou', difficulty: 'easy', before: 'きょう', after: 'はれです', answer: 'は', choices: ['は', 'を', 'に', 'で'] },
  { id: 'particle-hako', difficulty: 'easy', before: 'はこ', after: 'おもちゃを いれます', answer: 'に', choices: ['に', 'を', 'で', 'と'] },
  { id: 'particle-kouen', difficulty: 'normal', before: 'こうえん', after: 'あそびます', answer: 'で', choices: ['で', 'を', 'に', 'と'] },
  { id: 'particle-kureyon', difficulty: 'normal', before: 'クレヨン', after: 'えを かきます', answer: 'で', choices: ['で', 'を', 'に', 'は'] },
  { id: 'particle-inu', difficulty: 'normal', before: 'いぬ', after: 'はしっています', answer: 'が', choices: ['が', 'を', 'に', 'で'] },
  { id: 'particle-otouto', difficulty: 'normal', before: 'おとうと', after: 'いっしょに あそびます', answer: 'と', choices: ['と', 'を', 'に', 'で'] },
  { id: 'particle-hasami', difficulty: 'normal', before: 'はさみ', after: 'かみを きります', answer: 'で', choices: ['で', 'を', 'に', 'と'] },
  { id: 'particle-tomodachi', difficulty: 'normal', before: 'ともだち', after: 'はなします', answer: 'と', choices: ['と', 'を', 'に', 'で'] },
  { id: 'particle-neko', difficulty: 'normal', before: 'ねこ', after: 'へやに います', answer: 'が', choices: ['が', 'を', 'に', 'で'] },
  { id: 'particle-rain-reason', difficulty: 'hard', before: 'あめが ふった', after: 'かさを もちました', answer: 'ので', choices: ['ので', 'から', 'ながら', 'まえに'] },
  { id: 'particle-wash-first', difficulty: 'hard', before: 'てを あらって', after: 'ごはんを たべます', answer: 'から', choices: ['から', 'ので', 'ながら', 'あとで'] },
  { id: 'particle-music', difficulty: 'hard', before: 'おんがくを きき', after: 'えを かきます', answer: 'ながら', choices: ['ながら', 'ので', 'まえに', 'あとで'] },
  { id: 'particle-cold', difficulty: 'hard', before: 'さむいです', after: 'そとで あそびます', answer: 'が', choices: ['が', 'ので', 'から', 'ながら'] },
  { id: 'particle-study', difficulty: 'hard', before: 'べんきょうを した', after: 'ゲームを します', answer: 'あとで', choices: ['あとで', 'まえに', 'ながら', 'ので'] },
  { id: 'particle-sleep', difficulty: 'hard', before: 'ねる', after: 'はを みがきます', answer: 'まえに', choices: ['まえに', 'あとで', 'ので', 'ながら'] },
  { id: 'particle-breakfast', difficulty: 'hard', before: 'あさごはんを たべた', after: 'はを みがきます', answer: 'あとで', choices: ['あとで', 'まえに', 'ながら', 'から'] },
]

const shuffle = <T,>(items: readonly T[], random: () => number): T[] => {
  const shuffled = [...items]
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1))
    ;[shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]]
  }
  return shuffled
}

export function createParticleChoiceQuestions(
  difficulty: GameDifficulty = 'normal',
  random: () => number = Math.random,
): ParticleChoiceQuestion[] {
  return QUESTION_SOURCES.filter((source) => source.difficulty === difficulty).map((source) => {
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
