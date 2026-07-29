import type { KanaToPictureQuestion } from '../model/types'
import { PictureChoice } from './PictureChoice'

export type KanaQuestionProps = {
  question: KanaToPictureQuestion
  selectedChoiceId: string | null
  disabled: boolean
  onSelect: (choiceId: string) => void
}

export function KanaQuestion({ question, selectedChoiceId, disabled, onSelect }: KanaQuestionProps) {
  return (
    <section aria-label="かなの問題">
      <style>{`
        .kana-picture-choice:focus-visible {
          outline: 4px solid #f59e0b;
          outline-offset: 4px;
        }
        .kana-picture-choice:disabled {
          opacity: 0.72;
        }
      `}</style>
      <h2 style={{ color: '#0f172a', fontSize: 'clamp(4rem, 16vw, 7rem)', lineHeight: 1, margin: '0 0 2rem', textAlign: 'center' }}>
        {question.kana}
      </h2>
      <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fit, minmax(9rem, 1fr))' }}>
        {question.choices.map((choice) => (
          <PictureChoice
            key={choice.id}
            choice={choice}
            selected={selectedChoiceId === choice.id}
            disabled={disabled}
            onSelect={onSelect}
          />
        ))}
      </div>
    </section>
  )
}
