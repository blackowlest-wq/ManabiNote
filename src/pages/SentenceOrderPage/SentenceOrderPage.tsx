import { Link, useNavigate } from 'react-router-dom'
import { SentenceOrderQuestion } from '../../features/sentence-order/components/SentenceOrderQuestion'
import { useSentenceOrderSession } from '../../features/sentence-order/SentenceOrderSessionProvider'
import { isSentenceOrderComplete } from '../../features/sentence-order/model/sentenceOrderSession'
import { QuizProgress } from '../../features/quiz/components/QuizProgress'
import { PageLayout } from '../../shared/components/PageLayout'
import { PrimaryButton } from '../../shared/components/PrimaryButton'
import { DifficultySelector } from '../../shared/components/DifficultySelector'

export function SentenceOrderPage() {
  const navigate = useNavigate()
  const { session, error, startSession, selectChoice, undoChoice, submit, nextQuestion } = useSentenceOrderSession()

  if (!session || isSentenceOrderComplete(session)) {
    return (
      <PageLayout title="ことばを ならべよう">
        <DifficultySelector onSelect={startSession} />
        {error && <p role="alert">{error.message}</p>}
        <p><Link to="/sentences">ぶんの メニューへ</Link></p>
      </PageLayout>
    )
  }

  const question = session.questions[session.currentIndex]
  if (!question) {
    return <PageLayout title="ことばを ならべよう"><p>問題を表示できません。</p><Link to="/sentences">ぶんの メニューへ</Link></PageLayout>
  }

  const isLastQuestion = session.currentIndex === session.questions.length - 1
  const handleNext = () => {
    nextQuestion()
    if (isLastQuestion) navigate('/sentence-order/result')
  }

  return (
    <PageLayout title="ことばを ならべよう">
      <div className="sentence-order-page">
        <QuizProgress current={session.currentIndex + 1} total={session.questions.length} />
        <SentenceOrderQuestion
          question={question}
          selectedChoiceIds={session.selectedChoiceIds}
          feedback={session.feedback}
          onSelect={selectChoice}
          onUndo={undoChoice}
          onSubmit={submit}
        />
        {session.feedback === 'correct' && (
          <PrimaryButton className="sentence-order-next" onClick={handleNext}>
            {isLastQuestion ? 'けっかを みる' : 'つぎへ'}
          </PrimaryButton>
        )}
        {error && <p role="alert">{error.message}</p>}
      </div>
    </PageLayout>
  )
}
