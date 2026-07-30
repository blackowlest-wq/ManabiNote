import type { PictureChoice as PictureChoiceData } from '../model/types'

export type PictureChoiceProps = {
  choice: PictureChoiceData
  selected: boolean
  disabled: boolean
  onSelect: (choiceId: string) => void
}

export function PictureChoice({ choice, selected, disabled, onSelect }: PictureChoiceProps) {
  const imageSrc = (choice as PictureChoiceData & { imageSrc?: string }).imageSrc

  return (
    <button
      type="button"
      className="kana-picture-choice"
      aria-label={choice.label}
      aria-pressed={selected}
      disabled={disabled}
      onClick={() => onSelect(choice.id)}
    >
      <img src={imageSrc} alt={choice.label} width="160" height="160" />
      <span>{choice.label}</span>
    </button>
  )
}
