import { useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ShapePatternQuestion } from '../../features/shape-pattern/components/ShapePatternQuestion'
import { useShapePatternSession } from '../../features/shape-pattern/ShapePatternSessionProvider'
import { isShapePatternComplete } from '../../features/shape-pattern/model/shapePatternSession'
import { QuizProgress } from '../../features/quiz/components/QuizProgress'
import { PageLayout } from '../../shared/components/PageLayout'
import { PrimaryButton } from '../../shared/components/PrimaryButton'

export function ShapePatternPage() {
  const navigate = useNavigate()
  const { session, error, startSession, selectChoice, nextQuestion } = useShapePatternSession()

  useEffect(() => {
    if ((!session || isShapePatternComplete(session)) && !error) startSession()
  }, [session, error, startSession])

  if (!session || isShapePatternComplete(session)) {
    return (
      <PageLayout title="かたちの ならび">
        <p>ゲームを開始してください。</p>
        {error && <p role="alert">{error.message}</p>}
        <Link to="/shapes">かたちの メニューへ</Link>
      </PageLayout>
    )
  }

  const question = session.questions[session.currentIndex]
  if (!question) {
    return <PageLayout title="かたちの ならび"><p>問題を表示できません。</p><Link to="/shapes">かたちの メニューへ</Link></PageLayout>
  }

  const isLastQuestion = session.currentIndex === session.questions.length - 1
  const handleNext = () => {
    nextQuestion()
    if (isLastQuestion) navigate('/shape-pattern/result')
  }

  return (
    <PageLayout title="かたちの ならび">
      <div className="shape-pattern-page">
        <QuizProgress current={session.currentIndex + 1} total={session.questions.length} />
        <ShapePatternQuestion
          question={question}
          selectedChoiceId={session.selectedChoiceId}
          feedback={session.feedback}
          onSelect={selectChoice}
        />
        {session.feedback === 'correct' && (
          <PrimaryButton className="shape-pattern-next" onClick={handleNext}>
            {isLastQuestion ? 'けっかを みる' : 'つぎへ'}
          </PrimaryButton>
        )}
        {error && <p role="alert">{error.message}</p>}
      </div>
    </PageLayout>
  )
}
