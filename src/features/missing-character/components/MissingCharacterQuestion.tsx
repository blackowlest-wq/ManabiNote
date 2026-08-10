import { SpriteImage } from '../../question-types/kana-to-picture/components/SpriteImage'
import { PrimaryButton } from '../../../shared/components/PrimaryButton'
import { getMaskedReading } from '../model/missingCharacterQuestion'
import type { MissingCharacterFeedback } from '../model/missingCharacterSession'
import type { MissingCharacterQuestion as MissingCharacterQuestionData } from '../model/types'
import { MissingCharacterFeedback as FeedbackMessage } from './MissingCharacterFeedback'

export type MissingCharacterQuestionProps = {
  question: MissingCharacterQuestionData
  selectedChoiceId: string | null
  feedback: MissingCharacterFeedback
  onSelect: (choiceId: string) => void
}

export function MissingCharacterQuestion({
  question,
  selectedChoiceId,
  feedback,
  onSelect,
}: MissingCharacterQuestionProps) {
  const isLocked = feedback === 'correct'
  const maskedReading = getMaskedReading(question)

  return (
    <section className="missing-character-question" aria-label="ことばのあなうめ問題">
      <div className="missing-character-image-card">
        <SpriteImage image={question.image} alt={question.reading} width={220} height={220} />
      </div>

      <p className="missing-character-instruction">えの なまえを かんせいさせよう</p>
      <p className="missing-character-word" aria-label={`問題のことば ${maskedReading}`}>
        {Array.from(question.reading).map((character, index) => (
          <span
            className={`missing-character-word__character${index === question.missingIndex ? ' missing-character-word__character--blank' : ''}`}
            key={`${character}-${index}`}
            aria-hidden="true"
          >
            {index === question.missingIndex ? '＿' : character}
          </span>
        ))}
      </p>

      <div className="missing-character-choices" role="group" aria-label="足りない文字をえらぶ">
        {question.choices.map((choice) => (
          <PrimaryButton
            key={choice.id}
            className="missing-character-choice"
            aria-label={choice.character}
            aria-pressed={selectedChoiceId === choice.id}
            disabled={isLocked}
            onClick={() => onSelect(choice.id)}
          >
            {choice.character}
          </PrimaryButton>
        ))}
      </div>

      <FeedbackMessage feedback={feedback} />
    </section>
  )
}
