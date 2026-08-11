import { useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ShiritoriQuestion } from '../../features/shiritori/components/ShiritoriQuestion'
import { useShiritoriSession } from '../../features/shiritori/ShiritoriSessionProvider'
import { isShiritoriComplete } from '../../features/shiritori/model/shiritoriSession'
import { QuizProgress } from '../../features/quiz/components/QuizProgress'
import { PageLayout } from '../../shared/components/PageLayout'
import { PrimaryButton } from '../../shared/components/PrimaryButton'

export function ShiritoriPage() {
  const navigate = useNavigate()
  const { session, error, startSession, selectChoice, nextQuestion } = useShiritoriSession()

  useEffect(() => {
    if ((!session || isShiritoriComplete(session)) && !error) startSession()
  }, [session, error, startSession])

  if (!session || isShiritoriComplete(session)) {
    return (
      <PageLayout title="しりとり">
        <p>ゲームを開始してください。</p>
        {error && <p role="alert">{error.message}</p>}
        <Link to="/">ホームへ戻る</Link>
      </PageLayout>
    )
  }

  const question = session.questions[session.currentIndex]
  if (!question) {
    return <PageLayout title="しりとり"><p>問題を表示できません。</p><Link to="/">ホームへ戻る</Link></PageLayout>
  }

  const isLastQuestion = session.currentIndex === session.questions.length - 1
  const handleNext = () => {
    nextQuestion()
    if (isLastQuestion) navigate('/shiritori/result')
  }

  return (
    <PageLayout title="しりとり">
      <div className="shiritori-page">
        <QuizProgress current={session.currentIndex + 1} total={session.questions.length} />
        <ShiritoriQuestion
          question={question}
          selectedChoiceId={session.selectedChoiceId}
          feedback={session.feedback}
          onSelect={selectChoice}
        />
        {session.feedback === 'correct' && (
          <PrimaryButton className="shiritori-next" onClick={handleNext}>
            {isLastQuestion ? 'けっかを みる' : 'つぎへ'}
          </PrimaryButton>
        )}
        {error && <p role="alert">{error.message}</p>}
      </div>
    </PageLayout>
  )
}
