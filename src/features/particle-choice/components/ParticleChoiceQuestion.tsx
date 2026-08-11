import { PrimaryButton } from '../../../shared/components/PrimaryButton'
import { getMaskedParticleSentence } from '../model/particleChoiceQuestion'
import type { ParticleChoiceFeedback } from '../model/particleChoiceSession'
import type { ParticleChoiceQuestion as ParticleChoiceQuestionData } from '../model/types'
import { ParticleChoiceFeedback as FeedbackMessage } from './ParticleChoiceFeedback'

export type ParticleChoiceQuestionProps = {
  question: ParticleChoiceQuestionData
  selectedChoiceId: string | null
  feedback: ParticleChoiceFeedback
  onSelect: (choiceId: string) => void
}

export function ParticleChoiceQuestion({ question, selectedChoiceId, feedback, onSelect }: ParticleChoiceQuestionProps) {
  const isLocked = feedback === 'correct'
  const maskedSentence = getMaskedParticleSentence(question)

  return (
    <section className="particle-choice-question" aria-label="ことばを つなぐ問題">
      <p className="particle-choice-question__instruction">＿に はいる ことばは どれ？</p>
      <p className="particle-choice-sentence" aria-label={`問題のぶん ${maskedSentence}`}>{maskedSentence}</p>
      <div className="particle-choice-question__choices" role="group" aria-label="じょしをえらぶ">
        {question.choices.map((choice) => (
          <PrimaryButton
            key={choice.id}
            className="particle-choice-option"
            aria-label={choice.particle}
            aria-pressed={selectedChoiceId === choice.id}
            disabled={isLocked}
            onClick={() => onSelect(choice.id)}
          >
            {choice.particle}
          </PrimaryButton>
        ))}
      </div>
      <FeedbackMessage feedback={feedback} />
    </section>
  )
}
