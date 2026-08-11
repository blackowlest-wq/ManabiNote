import { useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { NumberOrderQuestion } from '../../features/number-order/components/NumberOrderQuestion'
import { useNumberOrderSession } from '../../features/number-order/NumberOrderSessionProvider'
import { isNumberOrderComplete } from '../../features/number-order/model/numberOrderSession'
import { QuizProgress } from '../../features/quiz/components/QuizProgress'
import { PageLayout } from '../../shared/components/PageLayout'
import { PrimaryButton } from '../../shared/components/PrimaryButton'

export function NumberOrderPage() {
  const navigate = useNavigate()
  const { session, error, startSession, selectChoice, nextQuestion } = useNumberOrderSession()

  useEffect(() => {
    if ((!session || isNumberOrderComplete(session)) && !error) startSession()
  }, [session, error, startSession])

  if (!session || isNumberOrderComplete(session)) {
    return (
      <PageLayout title="かずを ならべよう">
        <p>ゲームを開始してください。</p>
        {error && <p role="alert">{error.message}</p>}
        <Link to="/numbers">かずの メニューへ</Link>
      </PageLayout>
    )
  }

  const question = session.questions[session.currentIndex]
  if (!question) {
    return <PageLayout title="かずを ならべよう"><p>問題を表示できません。</p><Link to="/numbers">かずの メニューへ</Link></PageLayout>
  }

  const isLastQuestion = session.currentIndex === session.questions.length - 1
  const handleNext = () => {
    nextQuestion()
    if (isLastQuestion) navigate('/number-order/result')
  }

  return (
    <PageLayout title="かずを ならべよう">
      <div className="number-order-page">
        <QuizProgress current={session.currentIndex + 1} total={session.questions.length} />
        <NumberOrderQuestion
          question={question}
          selectedChoiceId={session.selectedChoiceId}
          feedback={session.feedback}
          onSelect={selectChoice}
        />
        {session.feedback === 'correct' && (
          <PrimaryButton className="number-order-next" onClick={handleNext}>
            {isLastQuestion ? 'けっかを みる' : 'つぎへ'}
          </PrimaryButton>
        )}
        {error && <p role="alert">{error.message}</p>}
      </div>
    </PageLayout>
  )
}
