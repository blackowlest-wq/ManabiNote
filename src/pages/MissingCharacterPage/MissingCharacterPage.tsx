import { useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { MissingCharacterQuestion } from '../../features/missing-character/components/MissingCharacterQuestion'
import { useMissingCharacterSession } from '../../features/missing-character/MissingCharacterSessionProvider'
import { isMissingCharacterComplete } from '../../features/missing-character/model/missingCharacterSession'
import { QuizProgress } from '../../features/quiz/components/QuizProgress'
import { PageLayout } from '../../shared/components/PageLayout'
import { PrimaryButton } from '../../shared/components/PrimaryButton'

export function MissingCharacterPage() {
  const navigate = useNavigate()
  const { session, error, startSession, selectChoice, nextQuestion } = useMissingCharacterSession()

  useEffect(() => {
    if ((!session || isMissingCharacterComplete(session)) && !error) startSession()
  }, [session, error, startSession])

  if (!session || isMissingCharacterComplete(session)) {
    return (
      <PageLayout title="ことばの あなうめ">
        <p>ゲームを開始してください。</p>
        {error && <p role="alert">{error.message}</p>}
        <Link to="/">ホームへ戻る</Link>
      </PageLayout>
    )
  }

  const question = session.questions[session.currentIndex]
  if (!question) {
    return <PageLayout title="ことばの あなうめ"><p>問題を表示できません。</p><Link to="/">ホームへ戻る</Link></PageLayout>
  }

  const isLastQuestion = session.currentIndex === session.questions.length - 1
  const handleNext = () => {
    nextQuestion()
    if (isLastQuestion) navigate('/missing-character/result')
  }

  return (
    <PageLayout title="ことばの あなうめ">
      <div className="missing-character-page">
        <QuizProgress current={session.currentIndex + 1} total={session.questions.length} />
        <MissingCharacterQuestion
          question={question}
          selectedChoiceId={session.selectedChoiceId}
          feedback={session.feedback}
          onSelect={selectChoice}
        />
        {session.feedback === 'correct' && (
          <PrimaryButton className="missing-character-next" onClick={handleNext}>
            {isLastQuestion ? 'けっかを みる' : 'つぎへ'}
          </PrimaryButton>
        )}
        {error && <p role="alert">{error.message}</p>}
      </div>
    </PageLayout>
  )
}
