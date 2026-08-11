import { useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { KanjiReadingQuestion } from '../../features/kanji-reading/components/KanjiReadingQuestion'
import { useKanjiReadingSession } from '../../features/kanji-reading/KanjiReadingSessionProvider'
import { isKanjiReadingComplete } from '../../features/kanji-reading/model/kanjiReadingSession'
import { QuizProgress } from '../../features/quiz/components/QuizProgress'
import { PageLayout } from '../../shared/components/PageLayout'
import { PrimaryButton } from '../../shared/components/PrimaryButton'

export function KanjiReadingPage() {
  const navigate = useNavigate()
  const { session, error, startSession, selectChoice, nextQuestion } = useKanjiReadingSession()

  useEffect(() => {
    if ((!session || isKanjiReadingComplete(session)) && !error) startSession()
  }, [session, error, startSession])

  if (!session || isKanjiReadingComplete(session)) {
    return (
      <PageLayout title="かんじの よみかた">
        <p>ゲームを開始してください。</p>
        {error && <p role="alert">{error.message}</p>}
        <Link to="/kanji">かんじの メニューへ</Link>
      </PageLayout>
    )
  }

  const question = session.questions[session.currentIndex]
  if (!question) {
    return <PageLayout title="かんじの よみかた"><p>問題を表示できません。</p><Link to="/kanji">かんじの メニューへ</Link></PageLayout>
  }

  const isLastQuestion = session.currentIndex === session.questions.length - 1
  const handleNext = () => {
    nextQuestion()
    if (isLastQuestion) navigate('/kanji-reading/result')
  }

  return (
    <PageLayout title="かんじの よみかた">
      <div className="kanji-reading-page">
        <QuizProgress current={session.currentIndex + 1} total={session.questions.length} />
        <KanjiReadingQuestion
          question={question}
          selectedChoiceId={session.selectedChoiceId}
          feedback={session.feedback}
          onSelect={selectChoice}
        />
        {session.feedback === 'correct' && (
          <PrimaryButton className="kanji-reading-next" onClick={handleNext}>
            {isLastQuestion ? 'けっかを みる' : 'つぎへ'}
          </PrimaryButton>
        )}
        {error && <p role="alert">{error.message}</p>}
      </div>
    </PageLayout>
  )
}
