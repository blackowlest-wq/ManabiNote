import type { PictureChoice as PictureChoiceData } from '../model/types'

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
      style={{
        alignItems: 'center',
        background: selected ? '#e0f2fe' : '#ffffff',
        border: selected ? '3px solid #0369a1' : '2px solid #94a3b8',
        borderRadius: '1rem',
        color: '#0f172a',
        cursor: disabled ? 'default' : 'pointer',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.5rem',
        minHeight: '12rem',
        padding: '1rem',
        width: '100%',
      }}
    >
      <img src={choice.imageSrc} alt={choice.label} width="160" height="160" />
      <span>{choice.label}</span>
    </button>
  )
}
