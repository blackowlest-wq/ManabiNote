import { QuestionDataError } from '../../question-types/kana-to-picture/model/validator'
import type { GameDifficulty } from '../../../shared/gameDifficulty'
import type { ClockQuestion, ClockTime } from './types'

const QUESTION_TIMES: Record<GameDifficulty, readonly ClockTime[]> = {
  easy: [
    { hour: 1, minute: 0 }, { hour: 2, minute: 0 }, { hour: 3, minute: 0 }, { hour: 4, minute: 0 },
    { hour: 5, minute: 0 }, { hour: 6, minute: 0 }, { hour: 7, minute: 0 }, { hour: 8, minute: 0 },
    { hour: 9, minute: 0 }, { hour: 10, minute: 0 }, { hour: 11, minute: 0 }, { hour: 12, minute: 0 },
  ],
  normal: [
    { hour: 1, minute: 30 }, { hour: 2, minute: 0 }, { hour: 3, minute: 30 }, { hour: 4, minute: 0 },
    { hour: 5, minute: 30 }, { hour: 6, minute: 0 }, { hour: 7, minute: 30 }, { hour: 8, minute: 0 },
    { hour: 9, minute: 30 }, { hour: 10, minute: 0 }, { hour: 11, minute: 30 }, { hour: 12, minute: 0 },
  ],
  hard: [
    { hour: 1, minute: 10 }, { hour: 2, minute: 15 }, { hour: 3, minute: 20 }, { hour: 4, minute: 25 },
    { hour: 5, minute: 35 }, { hour: 6, minute: 40 }, { hour: 7, minute: 45 }, { hour: 8, minute: 50 },
  ],
}

const shuffle = <T,>(items: readonly T[], random: () => number): T[] => {
  const shuffled = [...items]
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1))
    ;[shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]]
  }
  return shuffled
}

const nextHour = (hour: number) => hour === 12 ? 1 : hour + 1
const previousHour = (hour: number) => hour === 1 ? 12 : hour - 1

export function formatClockTime(time: ClockTime): string {
  if (time.minute === 0) return `${time.hour}じ`
  const suffix = time.minute % 10 === 5 ? 'ふん' : 'ぷん'
  return `${time.hour}じ ${time.minute}${suffix}`
}

export function getClockHandPoints(hour: number, minute: number) {
  const point = (angle: number, length: number) => {
    const radians = (angle - 90) * Math.PI / 180
    return {
      x: Math.round(100 + Math.cos(radians) * length),
      y: Math.round(100 + Math.sin(radians) * length),
    }
  }

  return {
    hour: point((hour % 12) * 30 + minute * 0.5, 58),
    minute: point(minute * 6, 76),
  }
}

export function createClockQuestions(
  difficulty: GameDifficulty,
  random: () => number = Math.random,
): ClockQuestion[] {
  return QUESTION_TIMES[difficulty].map((time, questionIndex) => {
    if (time.hour < 1 || time.hour > 12 || time.minute < 0 || time.minute >= 60 || time.minute % 5 !== 0) {
      throw new QuestionDataError()
    }

    const alternatives: ClockTime[] = [
      time,
      { hour: nextHour(time.hour), minute: time.minute },
      { hour: time.hour, minute: (time.minute + 15) % 60 },
      { hour: previousHour(time.hour), minute: (time.minute + 30) % 60 },
    ]
    if (new Set(alternatives.map(formatClockTime)).size !== 4) throw new QuestionDataError()

    const choices = shuffle(alternatives, random).map((choice, choiceIndex) => ({
      ...choice,
      id: `clock-${difficulty}-${questionIndex}-choice-${choiceIndex}`,
      label: formatClockTime(choice),
    }))
    const answerLabel = formatClockTime(time)
    const correctChoice = choices.find((choice) => choice.label === answerLabel)
    if (!correctChoice) throw new QuestionDataError()

    return {
      id: `clock-${difficulty}-${time.hour}-${time.minute}`,
      ...time,
      choices,
      correctChoiceId: correctChoice.id,
    }
  })
}
