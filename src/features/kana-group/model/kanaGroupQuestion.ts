import { HIRAGANA_CHARACTERS } from '../../kana-pair/model/kanaPairQuestion'
import type { KanaGroupQuestion } from './types'

type KanaGroupDefinition = {
  id: string
  label: string
}

const GROUPS: readonly KanaGroupDefinition[] = [
  { id: 'a', label: 'あいうえお' },
  { id: 'ka', label: 'かきくけこ' },
  { id: 'sa', label: 'さしすせそ' },
  { id: 'ta', label: 'たちつてと' },
  { id: 'na', label: 'なにぬねの' },
  { id: 'ha', label: 'はひふへほ' },
  { id: 'ma', label: 'まみむめも' },
  { id: 'ya', label: 'やゆよ' },
  { id: 'ra', label: 'らりるれろ' },
  { id: 'wa', label: 'わをん' },
]

const GROUP_BY_CHARACTER = new Map(
  GROUPS.flatMap((group) => Array.from(group.label).map((character) => [character, group] as const)),
)

const shuffle = <T,>(items: readonly T[], random: () => number): T[] => {
  const shuffled = [...items]
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1))
    ;[shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]]
  }
  return shuffled
}

export function createKanaGroupQuestions(random: () => number = Math.random): KanaGroupQuestion[] {
  return HIRAGANA_CHARACTERS.map((targetCharacter, index) => {
    const group = GROUP_BY_CHARACTER.get(targetCharacter)
    if (!group) throw new Error('かなの仲間を見つけられません')

    const distractors = shuffle(GROUPS.filter((candidate) => candidate.id !== group.id), random).slice(0, 3)
    const choiceGroups = shuffle([group, ...distractors], random)
    const choices = choiceGroups.map((choice, choiceIndex) => ({
      id: `kana-group-${index}-choice-${choiceIndex}`,
      label: choice.label,
    }))
    const correctChoice = choices.find((choice) => choice.label === group.label)
    if (!correctChoice || choices.length !== 4) throw new Error('かなの仲間問題を作成できません')

    return {
      id: `kana-group-${targetCharacter}`,
      targetCharacter,
      groupId: group.id,
      choices,
      correctChoiceId: correctChoice.id,
    }
  })
}
