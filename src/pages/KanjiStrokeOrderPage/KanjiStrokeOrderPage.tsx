import { useEffect, useRef, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { StrokeCanvas } from '../../features/question-types/kana-to-stroke/components/StrokeCanvas'
import type { StrokeRecognitionResult } from '../../features/question-types/kana-to-stroke/model/strokeRecognizer'
import { useKanjiStrokePractice } from '../../features/stroke-order/KanjiStrokePracticeProvider'
import { PageLayout } from '../../shared/components/PageLayout'
import { PrimaryButton } from '../../shared/components/PrimaryButton'

export function KanjiStrokeOrderPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const {
    session,
    error,
    startPractice,
    resetPractice,
    recordFailure,
    recordSuccess,
    nextCharacter,
  } = useKanjiStrokePractice()
  const [feedback, setFeedback] = useState<'retry' | 'success' | null>(null)
  const initialEntryChecked = useRef(false)

  useEffect(() => {
    if (initialEntryChecked.current) return

    initialEntryChecked.current = true
    if (location.pathname === '/kanji-stroke-order' && session?.status === 'complete') {
      resetPractice()
    }
  }, [location.pathname, resetPractice, session?.status])

  const shouldResetCompletedEntry =
    !initialEntryChecked.current &&
    location.pathname === '/kanji-stroke-order' &&
    session?.status === 'complete'

  if (!session || shouldResetCompletedEntry) {
    return (
      <PageLayout title="かんじの 書き順">
        <p>かんじを なぞって れんしゅうしよう。</p>
        <div className="stroke-row-actions">
          <PrimaryButton onClick={() => startPractice()}>れんしゅうをはじめる</PrimaryButton>
          <p><Link to="/kanji">かんじの メニューへ</Link></p>
        </div>
        {error && <p role="alert">{error.message}</p>}
      </PageLayout>
    )
  }

  if (session.status === 'complete') {
    return (
      <PageLayout title="かんじの 書き順">
        <h2>れんしゅうがおわったよ！</h2>
        <PrimaryButton onClick={() => navigate('/kanji-stroke-order/result')}>
          けっかを見る
        </PrimaryButton>
      </PageLayout>
    )
  }

  const question = session.questions[session.currentQuestionIndex]
  if (!question) {
    return (
      <PageLayout title="かんじの 書き順">
        <p role="alert">問題を表示できません。</p>
        <Link to="/kanji">かんじの メニューへ</Link>
      </PageLayout>
    )
  }

  const isCharacterComplete = session.status === 'character-complete'
  const isLastCharacter = session.currentQuestionIndex === session.questions.length - 1
  const completedStrokeCount = isCharacterComplete
    ? session.currentStrokeIndex + 1
    : session.currentStrokeIndex
  const completedStrokeIndexes = Array.from(
    { length: completedStrokeCount },
    (_, index) => index,
  )

  const handleStrokeResult = (result: StrokeRecognitionResult) => {
    if (result.accepted) {
      setFeedback('success')
      recordSuccess()
    } else {
      setFeedback('retry')
      recordFailure()
    }
  }

  const handleNextCharacter = () => {
    setFeedback(null)
    nextCharacter()
    if (isLastCharacter) navigate('/kanji-stroke-order/result')
  }

  return (
    <PageLayout title="かんじの 書き順">
      <div className="stroke-order-page">
        <p className="stroke-order-progress">{session.currentQuestionIndex + 1} / {session.questions.length}</p>
        <h2 className="stroke-order-kana">{question.kanji}</h2>
        <p className="stroke-order-stroke-progress">
          {session.currentStrokeIndex + 1}画目 / {question.strokes.length}画
        </p>
        <div className="stroke-feedback-slot" data-testid="kanji-stroke-feedback-slot">
          {feedback === 'retry' && (
            <p className="stroke-feedback stroke-feedback--retry" role="status" aria-live="polite">
              もういちど なぞってみよう
            </p>
          )}
          {feedback === 'success' && (
            <p className="stroke-feedback stroke-feedback--success" role="status" aria-live="polite">
              できたよ！
            </p>
          )}
        </div>
        <StrokeCanvas
          question={question}
          currentStrokeIndex={session.currentStrokeIndex}
          completedStrokeIndexes={completedStrokeIndexes}
          showFailureHint={feedback === 'retry'}
          disabled={isCharacterComplete}
          onStrokeResult={handleStrokeResult}
        />
        <div className="stroke-next-slot" data-testid="kanji-stroke-next-slot">
          {isCharacterComplete && (
            <PrimaryButton onClick={handleNextCharacter}>
              {isLastCharacter ? 'けっかを見る' : 'つぎの漢字へ'}
            </PrimaryButton>
          )}
        </div>
        {error && <p role="alert">{error.message}</p>}
      </div>
    </PageLayout>
  )
}
