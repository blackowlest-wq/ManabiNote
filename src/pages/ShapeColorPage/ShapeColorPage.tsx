import { useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ShapeColorQuestion } from '../../features/shape-color/components/ShapeColorQuestion'
import { useShapeColorSession } from '../../features/shape-color/ShapeColorSessionProvider'
import { isShapeColorComplete } from '../../features/shape-color/model/shapeColorSession'
import { QuizProgress } from '../../features/quiz/components/QuizProgress'
import { PageLayout } from '../../shared/components/PageLayout'
import { PrimaryButton } from '../../shared/components/PrimaryButton'

export function ShapeColorPage() {
  const navigate = useNavigate()
  const { session, error, startSession, selectChoice, nextQuestion } = useShapeColorSession()

  useEffect(() => {
    if ((!session || isShapeColorComplete(session)) && !error) startSession()
  }, [session, error, startSession])

  if (!session || isShapeColorComplete(session)) {
    return (
      <PageLayout title="いろと かたち">
        <p>ゲームを開始してください。</p>
        {error && <p role="alert">{error.message}</p>}
        <Link to="/">ホームへ戻る</Link>
      </PageLayout>
    )
  }

  const question = session.questions[session.currentIndex]
  if (!question) {
    return <PageLayout title="いろと かたち"><p>問題を表示できません。</p><Link to="/">ホームへ戻る</Link></PageLayout>
  }

  const isLastQuestion = session.currentIndex === session.questions.length - 1
  const handleNext = () => {
    nextQuestion()
    if (isLastQuestion) navigate('/shape-color/result')
  }

  return (
    <PageLayout title="いろと かたち">
      <div className="shape-color-page">
        <QuizProgress current={session.currentIndex + 1} total={session.questions.length} />
        <ShapeColorQuestion
          question={question}
          selectedChoiceId={session.selectedChoiceId}
          feedback={session.feedback}
          onSelect={selectChoice}
        />
        {session.feedback === 'correct' && (
          <PrimaryButton className="shape-color-next" onClick={handleNext}>
            {isLastQuestion ? 'けっかを みる' : 'つぎへ'}
          </PrimaryButton>
        )}
        {error && <p role="alert">{error.message}</p>}
      </div>
    </PageLayout>
  )
}
