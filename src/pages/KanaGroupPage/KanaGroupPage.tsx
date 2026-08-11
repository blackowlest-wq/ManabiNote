import { useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { KanaGroupQuestion } from '../../features/kana-group/components/KanaGroupQuestion'
import { useKanaGroupSession } from '../../features/kana-group/KanaGroupSessionProvider'
import { isKanaGroupComplete } from '../../features/kana-group/model/kanaGroupSession'
import { QuizProgress } from '../../features/quiz/components/QuizProgress'
import { PageLayout } from '../../shared/components/PageLayout'
import { PrimaryButton } from '../../shared/components/PrimaryButton'

export function KanaGroupPage() {
  const navigate = useNavigate()
  const { session, error, startSession, selectChoice, nextQuestion } = useKanaGroupSession()

  useEffect(() => {
    if ((!session || isKanaGroupComplete(session)) && !error) startSession()
  }, [session, error, startSession])

  if (!session || isKanaGroupComplete(session)) {
    return (
      <PageLayout title="かなの なかまわけ">
        <p>ゲームを開始してください。</p>
        {error && <p role="alert">{error.message}</p>}
        <Link to="/">ホームへ戻る</Link>
      </PageLayout>
    )
  }

  const question = session.questions[session.currentIndex]
  if (!question) {
    return <PageLayout title="かなの なかまわけ"><p>問題を表示できません。</p><Link to="/">ホームへ戻る</Link></PageLayout>
  }

  const isLastQuestion = session.currentIndex === session.questions.length - 1
  const handleNext = () => {
    nextQuestion()
    if (isLastQuestion) navigate('/kana-group/result')
  }

  return (
    <PageLayout title="かなの なかまわけ">
      <div className="kana-group-page">
        <QuizProgress current={session.currentIndex + 1} total={session.questions.length} />
        <KanaGroupQuestion
          question={question}
          selectedChoiceId={session.selectedChoiceId}
          feedback={session.feedback}
          onSelect={selectChoice}
        />
        {session.feedback === 'correct' && (
          <PrimaryButton className="kana-group-next" onClick={handleNext}>
            {isLastQuestion ? 'けっかを みる' : 'つぎへ'}
          </PrimaryButton>
        )}
        {error && <p role="alert">{error.message}</p>}
      </div>
    </PageLayout>
  )
}
