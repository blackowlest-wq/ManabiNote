import type { KanaToPictureQuestion } from '../model/types'
import { PictureChoice } from './PictureChoice'

export type KanaQuestionProps = {
  question: KanaToPictureQuestion
  selectedChoiceId: string | null
  disabled: boolean
  showLabels?: boolean
  onSelect: (choiceId: string) => void
}

export function KanaQuestion({ question, selectedChoiceId, disabled, showLabels = false, onSelect }: KanaQuestionProps) {
  return (
    <section aria-label="かなの問題">
      <h2 className="kana-question__kana">
        {question.kana}
      </h2>
      <p className="kana-question__instruction">
        「{question.kana}」から はじまる ことばを えらぼう
      </p>
      <div className="kana-question__choices">
        {question.choices.map((choice) => (
          <PictureChoice
            key={choice.id}
            choice={choice}
            selected={selectedChoiceId === choice.id}
            disabled={disabled}
            showLabel={disabled || showLabels}
            onSelect={onSelect}
          />
        ))}
      </div>
    </section>
  )
}
