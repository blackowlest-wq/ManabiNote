import { useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { CountingQuestion } from '../../features/counting/components/CountingQuestion'
import { useCountingSession } from '../../features/counting/CountingSessionProvider'
import { isCountingComplete } from '../../features/counting/model/countingSession'
import { QuizProgress } from '../../features/quiz/components/QuizProgress'
import { PageLayout } from '../../shared/components/PageLayout'
import { PrimaryButton } from '../../shared/components/PrimaryButton'

export function CountingPage() {
  const navigate = useNavigate()
  const { session, error, startSession, selectChoice, nextQuestion } = useCountingSession()

  useEffect(() => {
    if ((!session || isCountingComplete(session)) && !error) startSession()
  }, [session, error, startSession])

  if (!session || isCountingComplete(session)) {
    return (
      <PageLayout title="かずを かぞえよう">
        <p>ゲームを開始してください。</p>
        {error && <p role="alert">{error.message}</p>}
        <Link to="/">ホームへ戻る</Link>
      </PageLayout>
    )
  }

  const question = session.questions[session.currentIndex]
  if (!question) {
    return <PageLayout title="かずを かぞえよう"><p>問題を表示できません。</p><Link to="/">ホームへ戻る</Link></PageLayout>
  }

  const isLastQuestion = session.currentIndex === session.questions.length - 1
  const handleNext = () => {
    nextQuestion()
    if (isLastQuestion) navigate('/counting/result')
  }

  return (
    <PageLayout title="かずを かぞえよう">
      <div className="counting-page">
        <QuizProgress current={session.currentIndex + 1} total={session.questions.length} />
        <CountingQuestion
          question={question}
          selectedChoiceId={session.selectedChoiceId}
          feedback={session.feedback}
          onSelect={selectChoice}
        />
        {session.feedback === 'correct' && (
          <PrimaryButton className="counting-next" onClick={handleNext}>
            {isLastQuestion ? 'けっかを みる' : 'つぎへ'}
          </PrimaryButton>
        )}
        {error && <p role="alert">{error.message}</p>}
      </div>
    </PageLayout>
  )
}
