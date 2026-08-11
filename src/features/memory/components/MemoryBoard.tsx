import { PrimaryButton } from '../../../shared/components/PrimaryButton'
import { SpriteImage } from '../../question-types/kana-to-picture/components/SpriteImage'
import type { MemoryCard } from '../model/types'

export type MemoryBoardProps = {
  cards: readonly MemoryCard[]
  flippedCardIds: readonly string[]
  matchedPairIds: readonly string[]
  onFlip: (cardId: string) => void
}

export function MemoryBoard({ cards, flippedCardIds, matchedPairIds, onFlip }: MemoryBoardProps) {
  return (
    <div className="memory-board" role="grid" aria-label="カードをえらぶ">
      {cards.map((card, index) => {
        const isMatched = matchedPairIds.includes(card.pairId)
        const isFlipped = flippedCardIds.includes(card.id)
        const isVisible = isMatched || isFlipped
        const label = !isVisible
          ? `うらむきカード ${index + 1}`
          : card.kind === 'kana'
            ? `かな ${card.character} のカード`
            : `え ${card.label} のカード`

        return (
          <PrimaryButton
            key={card.id}
            className={`memory-card${isVisible ? ' memory-card--visible' : ''}${isMatched ? ' memory-card--matched' : ''}`}
            aria-label={label}
            aria-pressed={isVisible}
            disabled={isMatched}
            onClick={() => onFlip(card.id)}
          >
            {isVisible ? (
              card.kind === 'kana' ? (
                <span className="memory-card__kana" aria-hidden="true">{card.character}</span>
              ) : (
                <>
                  <SpriteImage image={card.image} alt={`${card.label}のえ`} width={112} height={112} />
                  <span className="memory-card__label" aria-hidden="true">{card.label}</span>
                </>
              )
            ) : (
              <span className="memory-card__back" aria-hidden="true">？</span>
            )}
          </PrimaryButton>
        )
      })}
    </div>
  )
}
