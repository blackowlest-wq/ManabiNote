import { useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { KanaPairQuestion } from '../../features/kana-pair/components/KanaPairQuestion'
import { useKanaPairSession } from '../../features/kana-pair/KanaPairSessionProvider'
import { isKanaPairComplete } from '../../features/kana-pair/model/kanaPairSession'
import { QuizProgress } from '../../features/quiz/components/QuizProgress'
import { PageLayout } from '../../shared/components/PageLayout'
import { PrimaryButton } from '../../shared/components/PrimaryButton'

export function KanaPairPage() {
  const navigate = useNavigate()
  const { session, error, startSession, selectChoice, nextQuestion } = useKanaPairSession()

  useEffect(() => {
    if ((!session || isKanaPairComplete(session)) && !error) startSession()
  }, [session, error, startSession])

  if (!session || isKanaPairComplete(session)) {
    return (
      <PageLayout title="ひらがなと カタカナ">
        <p>ゲームを開始してください。</p>
        {error && <p role="alert">{error.message}</p>}
        <Link to="/">ホームへ戻る</Link>
      </PageLayout>
    )
  }

  const question = session.questions[session.currentIndex]
  if (!question) {
    return <PageLayout title="ひらがなと カタカナ"><p>問題を表示できません。</p><Link to="/">ホームへ戻る</Link></PageLayout>
  }

  const isLastQuestion = session.currentIndex === session.questions.length - 1
  const handleNext = () => {
    nextQuestion()
    if (isLastQuestion) navigate('/kana-pair/result')
  }

  return (
    <PageLayout title="ひらがなと カタカナ">
      <div className="kana-pair-page">
        <QuizProgress current={session.currentIndex + 1} total={session.questions.length} />
        <KanaPairQuestion
          question={question}
          selectedChoiceId={session.selectedChoiceId}
          feedback={session.feedback}
          onSelect={selectChoice}
        />
        {session.feedback === 'correct' && (
          <PrimaryButton className="kana-pair-next" onClick={handleNext}>
            {isLastQuestion ? 'けっかを みる' : 'つぎへ'}
          </PrimaryButton>
        )}
        {error && <p role="alert">{error.message}</p>}
      </div>
    </PageLayout>
  )
}
