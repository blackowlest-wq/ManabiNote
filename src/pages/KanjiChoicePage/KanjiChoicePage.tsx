import { useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { KanjiChoiceQuestion } from '../../features/kanji-choice/components/KanjiChoiceQuestion'
import { useKanjiChoiceSession } from '../../features/kanji-choice/KanjiChoiceSessionProvider'
import { isKanjiChoiceComplete } from '../../features/kanji-choice/model/kanjiChoiceSession'
import { QuizProgress } from '../../features/quiz/components/QuizProgress'
import { PageLayout } from '../../shared/components/PageLayout'
import { PrimaryButton } from '../../shared/components/PrimaryButton'

export function KanjiChoicePage() {
  const navigate = useNavigate()
  const { session, error, startSession, selectChoice, nextQuestion } = useKanjiChoiceSession()

  useEffect(() => {
    if ((!session || isKanjiChoiceComplete(session)) && !error) startSession()
  }, [session, error, startSession])

  if (!session || isKanjiChoiceComplete(session)) {
    return (
      <PageLayout title="よみから かんじ">
        <p>ゲームを開始してください。</p>
        {error && <p role="alert">{error.message}</p>}
        <Link to="/kanji">かんじの メニューへ</Link>
      </PageLayout>
    )
  }

  const question = session.questions[session.currentIndex]
  if (!question) {
    return <PageLayout title="よみから かんじ"><p>問題を表示できません。</p><Link to="/kanji">かんじの メニューへ</Link></PageLayout>
  }

  const isLastQuestion = session.currentIndex === session.questions.length - 1
  const handleNext = () => {
    nextQuestion()
    if (isLastQuestion) navigate('/kanji-choice/result')
  }

  return (
    <PageLayout title="よみから かんじ">
      <div className="kanji-choice-page">
        <QuizProgress current={session.currentIndex + 1} total={session.questions.length} />
        <KanjiChoiceQuestion
          question={question}
          selectedChoiceId={session.selectedChoiceId}
          feedback={session.feedback}
          onSelect={selectChoice}
        />
        {session.feedback === 'correct' && (
          <PrimaryButton className="kanji-choice-next" onClick={handleNext}>
            {isLastQuestion ? 'けっかを みる' : 'つぎへ'}
          </PrimaryButton>
        )}
        {error && <p role="alert">{error.message}</p>}
      </div>
    </PageLayout>
  )
}
