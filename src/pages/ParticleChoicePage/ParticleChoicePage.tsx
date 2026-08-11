import { Link, useNavigate } from 'react-router-dom'
import { ParticleChoiceQuestion } from '../../features/particle-choice/components/ParticleChoiceQuestion'
import { useParticleChoiceSession } from '../../features/particle-choice/ParticleChoiceSessionProvider'
import { isParticleChoiceComplete } from '../../features/particle-choice/model/particleChoiceSession'
import { QuizProgress } from '../../features/quiz/components/QuizProgress'
import { PageLayout } from '../../shared/components/PageLayout'
import { PrimaryButton } from '../../shared/components/PrimaryButton'
import { DifficultySelector } from '../../shared/components/DifficultySelector'

export function ParticleChoicePage() {
  const navigate = useNavigate()
  const { session, error, startSession, selectChoice, nextQuestion } = useParticleChoiceSession()

  if (!session || isParticleChoiceComplete(session)) {
    return (
      <PageLayout title="ことばを つなごう">
        <DifficultySelector onSelect={startSession} />
        {error && <p role="alert">{error.message}</p>}
        <p><Link to="/sentences">ぶんの メニューへ</Link></p>
      </PageLayout>
    )
  }

  const question = session.questions[session.currentIndex]
  if (!question) {
    return <PageLayout title="ことばを つなごう"><p>問題を表示できません。</p><Link to="/sentences">ぶんの メニューへ</Link></PageLayout>
  }

  const isLastQuestion = session.currentIndex === session.questions.length - 1
  const handleNext = () => {
    nextQuestion()
    if (isLastQuestion) navigate('/particle-choice/result')
  }

  return (
    <PageLayout title="ことばを つなごう">
      <div className="particle-choice-page">
        <QuizProgress current={session.currentIndex + 1} total={session.questions.length} />
        <ParticleChoiceQuestion
          question={question}
          selectedChoiceId={session.selectedChoiceId}
          feedback={session.feedback}
          onSelect={selectChoice}
        />
        {session.feedback === 'correct' && (
          <PrimaryButton className="particle-choice-next" onClick={handleNext}>
            {isLastQuestion ? 'けっかを みる' : 'つぎへ'}
          </PrimaryButton>
        )}
        {error && <p role="alert">{error.message}</p>}
      </div>
    </PageLayout>
  )
}
