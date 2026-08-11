import { PrimaryButton } from '../../../shared/components/PrimaryButton'
import type { AudioKanaFeedback } from '../model/audioKanaSession'
import type { AudioKanaQuestion as AudioKanaQuestionData } from '../model/types'
import { AudioKanaFeedback as FeedbackMessage } from './AudioKanaFeedback'

export type AudioKanaQuestionProps = {
  question: AudioKanaQuestionData
  selectedChoiceId: string | null
  feedback: AudioKanaFeedback
  onPlay: () => void
  onSelect: (choiceId: string) => void
}

export function AudioKanaQuestion({ question, selectedChoiceId, feedback, onPlay, onSelect }: AudioKanaQuestionProps) {
  const isLocked = feedback === 'correct'

  return (
    <section className="audio-kana-question" aria-label="おとからかなをえらぶ問題">
      <PrimaryButton className="audio-kana-play" onClick={onPlay}>
        おとを きく
      </PrimaryButton>
      <p className="audio-kana-question__instruction">おとを きいて、かなを えらぼう</p>
      <div className="audio-kana-question__choices" role="group" aria-label="かなをえらぶ">
        {question.choices.map((choice) => (
          <PrimaryButton
            key={choice.id}
            className="audio-kana-choice"
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
