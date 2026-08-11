import { useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { NumberCompareQuestion } from '../../features/number-compare/components/NumberCompareQuestion'
import { useNumberCompareSession } from '../../features/number-compare/NumberCompareSessionProvider'
import { isNumberCompareComplete } from '../../features/number-compare/model/numberCompareSession'
import { QuizProgress } from '../../features/quiz/components/QuizProgress'
import { PageLayout } from '../../shared/components/PageLayout'
import { PrimaryButton } from '../../shared/components/PrimaryButton'

export function NumberComparePage() {
  const navigate = useNavigate()
  const { session, error, startSession, selectChoice, nextQuestion } = useNumberCompareSession()

  useEffect(() => {
    if ((!session || isNumberCompareComplete(session)) && !error) startSession()
  }, [session, error, startSession])

  if (!session || isNumberCompareComplete(session)) {
    return (
      <PageLayout title="おおきい かずは どれ？">
        <p>ゲームを開始してください。</p>
        {error && <p role="alert">{error.message}</p>}
        <Link to="/numbers">かずの メニューへ</Link>
      </PageLayout>
    )
  }

  const question = session.questions[session.currentIndex]
  if (!question) {
    return <PageLayout title="おおきい かずは どれ？"><p>問題を表示できません。</p><Link to="/numbers">かずの メニューへ</Link></PageLayout>
  }

  const isLastQuestion = session.currentIndex === session.questions.length - 1
  const handleNext = () => {
    nextQuestion()
    if (isLastQuestion) navigate('/number-compare/result')
  }

  return (
    <PageLayout title="おおきい かずは どれ？">
      <div className="number-compare-page">
        <QuizProgress current={session.currentIndex + 1} total={session.questions.length} />
        <NumberCompareQuestion
          question={question}
          selectedChoiceId={session.selectedChoiceId}
          feedback={session.feedback}
          onSelect={selectChoice}
        />
        {session.feedback === 'correct' && (
          <PrimaryButton className="number-compare-next" onClick={handleNext}>
            {isLastQuestion ? 'けっかを みる' : 'つぎへ'}
          </PrimaryButton>
        )}
        {error && <p role="alert">{error.message}</p>}
      </div>
    </PageLayout>
  )
}
