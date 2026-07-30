import type { PictureChoice as PictureChoiceData } from '../model/types'
import { SpriteImage } from './SpriteImage'

export type PictureChoiceProps = {
  choice: PictureChoiceData
  selected: boolean
  disabled: boolean
  showLabel: boolean
  onSelect: (choiceId: string) => void
}

export function PictureChoice({ choice, selected, disabled, showLabel, onSelect }: PictureChoiceProps) {
  return (
    <button
      type="button"
      className="kana-picture-choice"
      aria-label={choice.label}
      aria-pressed={selected}
      disabled={disabled}
      onClick={() => onSelect(choice.id)}
    >
      <SpriteImage image={choice.image} alt={choice.label} />
      {showLabel && <span>{choice.label}</span>}
    </button>
  )
}
