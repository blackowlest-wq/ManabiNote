import { useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { DakutenQuestion } from '../../features/dakuten/components/DakutenQuestion'
import { useDakutenSession } from '../../features/dakuten/DakutenSessionProvider'
import { isDakutenComplete } from '../../features/dakuten/model/dakutenSession'
import { QuizProgress } from '../../features/quiz/components/QuizProgress'
import { PageLayout } from '../../shared/components/PageLayout'
import { PrimaryButton } from '../../shared/components/PrimaryButton'

export function DakutenPage() {
  const navigate = useNavigate()
  const { session, error, startSession, selectChoice, nextQuestion } = useDakutenSession()

  useEffect(() => {
    if ((!session || isDakutenComplete(session)) && !error) startSession()
  }, [session, error, startSession])

  if (!session || isDakutenComplete(session)) {
    return (
      <PageLayout title="てんてんと まる">
        <p>ゲームを開始してください。</p>
        {error && <p role="alert">{error.message}</p>}
        <Link to="/">ホームへ戻る</Link>
      </PageLayout>
    )
  }

  const question = session.questions[session.currentIndex]
  if (!question) {
    return <PageLayout title="てんてんと まる"><p>問題を表示できません。</p><Link to="/">ホームへ戻る</Link></PageLayout>
  }

  const isLastQuestion = session.currentIndex === session.questions.length - 1
  const handleNext = () => {
    nextQuestion()
    if (isLastQuestion) navigate('/dakuten/result')
  }

  return (
    <PageLayout title="てんてんと まる">
      <div className="dakuten-page">
        <QuizProgress current={session.currentIndex + 1} total={session.questions.length} />
        <DakutenQuestion
          question={question}
          selectedChoiceId={session.selectedChoiceId}
          feedback={session.feedback}
          onSelect={selectChoice}
        />
        {session.feedback === 'correct' && (
          <PrimaryButton className="dakuten-next" onClick={handleNext}>
            {isLastQuestion ? 'けっかを みる' : 'つぎへ'}
          </PrimaryButton>
        )}
        {error && <p role="alert">{error.message}</p>}
      </div>
    </PageLayout>
  )
}
