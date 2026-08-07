import { useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { WordBuilderQuestion } from '../../features/word-builder/components/WordBuilderQuestion'
import { useWordBuilderSession } from '../../features/word-builder/WordBuilderSessionProvider'
import { isWordBuilderComplete } from '../../features/word-builder/model/wordBuilderSession'
import { QuizProgress } from '../../features/quiz/components/QuizProgress'
import { PageLayout } from '../../shared/components/PageLayout'
import { PrimaryButton } from '../../shared/components/PrimaryButton'

export function WordBuilderPage() {
  const navigate = useNavigate()
  const { session, error, startSession, selectTile, undoLastTile, submitWord, nextWord } = useWordBuilderSession()

  useEffect(() => {
    if ((!session || isWordBuilderComplete(session)) && !error) startSession()
  }, [session, error, startSession])

  useEffect(() => {
    if (
      !session ||
      session.feedback !== 'correct' ||
      session.currentIndex !== session.questions.length - 1
    ) return

    nextWord()
    navigate('/word-builder/result')
  }, [session, navigate, nextWord])

  if (!session || isWordBuilderComplete(session)) {
    return (
      <PageLayout title="ことばをつくろう">
        <p>ゲームを開始してください。</p>
        {error && <p role="alert">{error.message}</p>}
        <Link to="/">ホームへ戻る</Link>
      </PageLayout>
    )
  }

  const question = session.questions[session.currentIndex]
  if (!question) {
    return <PageLayout title="ことばをつくろう"><p>問題を表示できません。</p><Link to="/">ホームへ戻る</Link></PageLayout>
  }

  const handleNext = () => {
    const isLastQuestion = session.currentIndex === session.questions.length - 1
    nextWord()
    if (isLastQuestion) navigate('/word-builder/result')
  }

  return (
    <PageLayout title="ことばをつくろう">
      <div className="word-builder-page">
        <QuizProgress current={session.currentIndex + 1} total={session.questions.length} />
        <p className="word-builder-instruction">えの なまえを つくろう</p>
        <WordBuilderQuestion
          question={question}
          tiles={session.tiles}
          selectedTileIds={session.selectedTileIds}
          feedback={session.feedback}
          onSelect={selectTile}
          onUndo={undoLastTile}
          onSubmit={submitWord}
        />
        {session.feedback === 'correct' && (
          <PrimaryButton className="word-builder-next" onClick={handleNext}>
            つぎへ
          </PrimaryButton>
        )}
        {error && <p role="alert">{error.message}</p>}
      </div>
    </PageLayout>
  )
}
