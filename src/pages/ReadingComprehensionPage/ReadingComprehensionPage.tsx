import { Link, useNavigate } from 'react-router-dom'
import { ReadingComprehensionQuestion } from '../../features/reading-comprehension/components/ReadingComprehensionQuestion'
import { useReadingComprehensionSession } from '../../features/reading-comprehension/ReadingComprehensionSessionProvider'
import { isReadingComprehensionComplete } from '../../features/reading-comprehension/model/readingComprehensionSession'
import { QuizProgress } from '../../features/quiz/components/QuizProgress'
import { DifficultySelector } from '../../shared/components/DifficultySelector'
import { PageLayout } from '../../shared/components/PageLayout'
import { PrimaryButton } from '../../shared/components/PrimaryButton'

export function ReadingComprehensionPage() {
  const navigate = useNavigate()
  const { session, error, startSession, selectChoice, nextQuestion } = useReadingComprehensionSession()

  if (!session || isReadingComprehensionComplete(session)) {
    return (
      <PageLayout title="ぶんを よんで こたえよう">
        <DifficultySelector onSelect={startSession} />
        {error && <p role="alert">{error.message}</p>}
        <p><Link to="/sentences">ぶんの メニューへ</Link></p>
      </PageLayout>
    )
  }

  const question = session.questions[session.currentIndex]
  if (!question) {
    return <PageLayout title="ぶんを よんで こたえよう"><p>問題を表示できません。</p><Link to="/sentences">ぶんの メニューへ</Link></PageLayout>
  }

  const isLastQuestion = session.currentIndex === session.questions.length - 1
  const handleNext = () => {
    nextQuestion()
    if (isLastQuestion) navigate('/reading-comprehension/result')
  }

  return (
    <PageLayout title="ぶんを よんで こたえよう">
      <div className="reading-comprehension-page">
        <QuizProgress current={session.currentIndex + 1} total={session.questions.length} />
        <ReadingComprehensionQuestion
          question={question}
          selectedChoiceId={session.selectedChoiceId}
          feedback={session.feedback}
          onSelect={selectChoice}
        />
        {session.feedback === 'correct' && (
          <PrimaryButton className="reading-comprehension-next" onClick={handleNext}>
            {isLastQuestion ? 'けっかを みる' : 'つぎへ'}
          </PrimaryButton>
        )}
        {error && <p role="alert">{error.message}</p>}
      </div>
    </PageLayout>
  )
}
