import { useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { SmallKanaQuestion } from '../../features/small-kana/components/SmallKanaQuestion'
import { useSmallKanaSession } from '../../features/small-kana/SmallKanaSessionProvider'
import { isSmallKanaComplete } from '../../features/small-kana/model/smallKanaSession'
import { QuizProgress } from '../../features/quiz/components/QuizProgress'
import { PageLayout } from '../../shared/components/PageLayout'
import { PrimaryButton } from '../../shared/components/PrimaryButton'

export function SmallKanaPage() {
  const navigate = useNavigate()
  const { session, error, startSession, selectChoice, nextQuestion } = useSmallKanaSession()

  useEffect(() => {
    if ((!session || isSmallKanaComplete(session)) && !error) startSession()
  }, [session, error, startSession])

  if (!session || isSmallKanaComplete(session)) {
    return (
      <PageLayout title="ちいさい かな">
        <p>ゲームを開始してください。</p>
        {error && <p role="alert">{error.message}</p>}
        <Link to="/">ホームへ戻る</Link>
      </PageLayout>
    )
  }

  const question = session.questions[session.currentIndex]
  if (!question) {
    return <PageLayout title="ちいさい かな"><p>問題を表示できません。</p><Link to="/">ホームへ戻る</Link></PageLayout>
  }

  const isLastQuestion = session.currentIndex === session.questions.length - 1
  const handleNext = () => {
    nextQuestion()
    if (isLastQuestion) navigate('/small-kana/result')
  }

  return (
    <PageLayout title="ちいさい かな">
      <div className="small-kana-page">
        <QuizProgress current={session.currentIndex + 1} total={session.questions.length} />
        <SmallKanaQuestion
          question={question}
          selectedChoiceId={session.selectedChoiceId}
          feedback={session.feedback}
          onSelect={selectChoice}
        />
        {session.feedback === 'correct' && (
          <PrimaryButton className="small-kana-next" onClick={handleNext}>
            {isLastQuestion ? 'けっかを みる' : 'つぎへ'}
          </PrimaryButton>
        )}
        {error && <p role="alert">{error.message}</p>}
      </div>
    </PageLayout>
  )
}
