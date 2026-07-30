import type { PictureChoice as PictureChoiceData } from '../model/types'
import { SpriteImage } from './SpriteImage'

export type PictureChoiceProps = {
  choice: PictureChoiceData
  selected: boolean
  disabled: boolean
  onSelect: (choiceId: string) => void
}

export function PictureChoice({ choice, selected, disabled, onSelect }: PictureChoiceProps) {
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
      <span>{choice.label}</span>
    </button>
  )
}
