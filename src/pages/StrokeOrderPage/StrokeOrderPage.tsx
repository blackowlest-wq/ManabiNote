import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { StrokeCanvas } from '../../features/question-types/kana-to-stroke/components/StrokeCanvas'
import type { StrokeRecognitionResult } from '../../features/question-types/kana-to-stroke/model/strokeRecognizer'
import { useStrokePractice } from '../../features/stroke-order/StrokePracticeProvider'
import { PageLayout } from '../../shared/components/PageLayout'
import { PrimaryButton } from '../../shared/components/PrimaryButton'

export function StrokeOrderPage() {
  const navigate = useNavigate()
  const {
    session,
    error,
    startPractice,
    recordFailure,
    recordSuccess,
    nextCharacter,
  } = useStrokePractice()
  const [feedback, setFeedback] = useState<'retry' | null>(null)

  if (!session) {
    return (
      <PageLayout title="書き順れんしゅう">
        <p>お手本をなぞって、ひらがなを書いてみよう。</p>
        <PrimaryButton onClick={startPractice}>れんしゅうをはじめる</PrimaryButton>
        {error && <p role="alert">{error.message}</p>}
        <p><Link to="/">ホームへ戻る</Link></p>
      </PageLayout>
    )
  }

  if (session.status === 'complete') {
    return (
      <PageLayout title="書き順れんしゅう">
        <h2>れんしゅうがおわったよ！</h2>
        <PrimaryButton onClick={() => navigate('/stroke-order/result')}>
          けっかを見る
        </PrimaryButton>
      </PageLayout>
    )
  }

  const question = session.questions[session.currentQuestionIndex]
  if (!question) {
    return (
      <PageLayout title="書き順れんしゅう">
        <p role="alert">問題を表示できません。</p>
        <Link to="/">ホームへ戻る</Link>
      </PageLayout>
    )
  }

  const isCharacterComplete = session.status === 'character-complete'
  const isLastCharacter = session.currentQuestionIndex === session.questions.length - 1
  const completedStrokeIndexes = Array.from(
    { length: session.currentStrokeIndex },
    (_, index) => index,
  )

  const handleStrokeResult = (result: StrokeRecognitionResult) => {
    if (result.accepted) {
      setFeedback(null)
      recordSuccess()
    } else {
      setFeedback('retry')
      recordFailure()
    }
  }

  const handleNextCharacter = () => {
    setFeedback(null)
    nextCharacter()
    if (isLastCharacter) navigate('/stroke-order/result')
  }

  return (
    <PageLayout title="書き順れんしゅう">
      <div className="stroke-order-page">
        <p className="stroke-order-progress">{session.currentQuestionIndex + 1} / {session.questions.length}</p>
        <h2 className="stroke-order-kana">{question.kana}</h2>
        <p className="stroke-order-stroke-progress">
          {session.currentStrokeIndex + 1}画目 / {question.strokes.length}画
        </p>
        {feedback === 'retry' && (
          <p className="stroke-feedback stroke-feedback--retry" role="status" aria-live="polite">
            もういちど なぞってみよう
          </p>
        )}
        <StrokeCanvas
          question={question}
          currentStrokeIndex={session.currentStrokeIndex}
          completedStrokeIndexes={completedStrokeIndexes}
          disabled={isCharacterComplete}
          onStrokeResult={handleStrokeResult}
        />
        {isCharacterComplete && (
          <PrimaryButton onClick={handleNextCharacter}>
            {isLastCharacter ? 'けっかを見る' : 'つぎの文字へ'}
          </PrimaryButton>
        )}
        {error && <p role="alert">{error.message}</p>}
      </div>
    </PageLayout>
  )
}
