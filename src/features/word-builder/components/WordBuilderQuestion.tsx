import { SpriteImage } from '../../question-types/kana-to-picture/components/SpriteImage'
import { PrimaryButton } from '../../../shared/components/PrimaryButton'
import type { WordBuilderFeedback } from '../model/wordBuilderSession'
import type { WordBuilderQuestion as WordBuilderQuestionData, WordTile } from '../model/types'
import { WordBuilderFeedback as FeedbackMessage } from './WordBuilderFeedback'

export type WordBuilderQuestionProps = {
  question: WordBuilderQuestionData
  tiles: readonly WordTile[]
  selectedTileIds: readonly string[]
  feedback: WordBuilderFeedback
  onSelect: (tileId: string) => void
  onUndo: () => void
  onSubmit: () => void
}

export function WordBuilderQuestion({
  question,
  tiles,
  selectedTileIds,
  feedback,
  onSelect,
  onUndo,
  onSubmit,
}: WordBuilderQuestionProps) {
  const selectedTileIdSet = new Set(selectedTileIds)
  const selectedCharacters = selectedTileIds.map(
    (tileId) => tiles.find((tile) => tile.id === tileId)?.character ?? '',
  )
  const availableTiles = tiles.filter((tile) => !selectedTileIdSet.has(tile.id))
  const isComplete = selectedCharacters.length === Array.from(question.reading).length
  const isLocked = feedback === 'correct'

  return (
    <section className="word-builder-question" aria-label="ことばをつくる問題">
      <div className="word-builder-image-card">
        <SpriteImage image={question.image} alt={question.reading} width={220} height={220} />
      </div>

      <div className="word-builder-selected" role="group" aria-label="えらんだ文字">
        {selectedCharacters.length > 0 ? selectedCharacters.map((character, index) => (
          <span className="word-builder-selected__character" key={`${character}-${index}`}>
            {character}
          </span>
        )) : <span className="word-builder-selected__empty">ここに ならぶよ</span>}
      </div>

      <div className="word-builder-tiles" role="group" aria-label="文字をえらぶ">
        {availableTiles.map((tile) => (
          <button
            key={tile.id}
            type="button"
            className="word-builder-tile"
            aria-label={tile.character}
            aria-pressed={false}
            disabled={isLocked}
            onClick={() => onSelect(tile.id)}
          >
            {tile.character}
          </button>
        ))}
      </div>

      <div className="word-builder-actions">
        <PrimaryButton
          className="word-builder-undo"
          disabled={selectedTileIds.length === 0 || isLocked}
          onClick={onUndo}
        >
          もどす
        </PrimaryButton>
        {isComplete && !isLocked && (
          <PrimaryButton className="word-builder-submit" onClick={onSubmit}>
            できた！
          </PrimaryButton>
        )}
      </div>

      <FeedbackMessage feedback={feedback} />
    </section>
  )
}
