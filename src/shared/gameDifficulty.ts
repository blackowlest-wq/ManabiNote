export type GameDifficulty = 'easy' | 'normal' | 'hard'

export type GameDifficultyOption = {
  id: GameDifficulty
  label: string
  description: string
}

export const GAME_DIFFICULTIES: readonly GameDifficultyOption[] = [
  { id: 'easy', label: 'かんたん', description: 'はじめてでも あそびやすい' },
  { id: 'normal', label: 'ふつう', description: 'すこし かんがえて ちょうせん' },
  { id: 'hard', label: 'むずかしい', description: 'じっくり かんがえて ちょうせん' },
]

export function getDifficultyLabel(difficulty: GameDifficulty): string {
  return GAME_DIFFICULTIES.find((option) => option.id === difficulty)?.label ?? difficulty
}
