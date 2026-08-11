import { Link, useNavigate } from 'react-router-dom'
import { ClockQuestion } from '../../features/clock/components/ClockQuestion'
import { useClockSession } from '../../features/clock/ClockSessionProvider'
import { isClockComplete } from '../../features/clock/model/clockSession'
import { QuizProgress } from '../../features/quiz/components/QuizProgress'
import { DifficultySelector } from '../../shared/components/DifficultySelector'
import { PageLayout } from '../../shared/components/PageLayout'
import { PrimaryButton } from '../../shared/components/PrimaryButton'

export function ClockPage() {
  const navigate = useNavigate()
  const { session, error, startSession, selectChoice, nextQuestion } = useClockSession()

  if (!session || isClockComplete(session)) {
    return (
      <PageLayout title="とけいを よもう">
        <DifficultySelector onSelect={startSession} />
        {error && <p role="alert">{error.message}</p>}
        <p><Link to="/numbers">かずの メニューへ</Link></p>
      </PageLayout>
    )
  }

  const question = session.questions[session.currentIndex]
  if (!question) {
    return <PageLayout title="とけいを よもう"><p>問題を表示できません。</p><Link to="/numbers">かずの メニューへ</Link></PageLayout>
  }

  const isLastQuestion = session.currentIndex === session.questions.length - 1
  const handleNext = () => {
    nextQuestion()
    if (isLastQuestion) navigate('/clock/result')
  }

  return (
    <PageLayout title="とけいを よもう">
      <div className="clock-page">
        <QuizProgress current={session.currentIndex + 1} total={session.questions.length} />
        <ClockQuestion question={question} selectedChoiceId={session.selectedChoiceId} feedback={session.feedback} onSelect={selectChoice} />
        {session.feedback === 'correct' && (
          <PrimaryButton className="clock-next" onClick={handleNext}>
            {isLastQuestion ? 'けっかを みる' : 'つぎへ'}
          </PrimaryButton>
        )}
        {error && <p role="alert">{error.message}</p>}
      </div>
    </PageLayout>
  )
}
