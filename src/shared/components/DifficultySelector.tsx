import { GAME_DIFFICULTIES, type GameDifficulty } from '../gameDifficulty'

export type DifficultySelectorProps = {
  onSelect: (difficulty: GameDifficulty) => void
}

export function DifficultySelector({ onSelect }: DifficultySelectorProps) {
  return (
    <section className="difficulty-selector" aria-labelledby="difficulty-selector-title">
      <h2 id="difficulty-selector-title">むずかしさを えらぼう</h2>
      <div className="difficulty-selector__options">
        {GAME_DIFFICULTIES.map((option) => (
          <button
            key={option.id}
            type="button"
            className={`difficulty-option difficulty-option--${option.id}`}
            onClick={() => onSelect(option.id)}
          >
            <span className="difficulty-option__label">{option.label}</span>
            <span className="difficulty-option__description">{option.description}</span>
          </button>
        ))}
      </div>
    </section>
  )
}
