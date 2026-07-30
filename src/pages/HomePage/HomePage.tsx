import { Link, useNavigate } from 'react-router-dom'
import { useQuizSession } from '../../features/quiz/QuizSessionProvider'
import { useStrokePractice } from '../../features/stroke-order/StrokePracticeProvider'
import { PageLayout } from '../../shared/components/PageLayout'
import { PrimaryButton } from '../../shared/components/PrimaryButton'

export function HomePage() {
  const navigate = useNavigate()
  const { startSession, error } = useQuizSession()
  const { startPractice } = useStrokePractice()

  const handleStart = () => {
    if (startSession()) navigate('/quiz')
  }

  const handleStrokePracticeStart = () => {
    if (startPractice()) navigate('/stroke-order')
  }

  return (
    <PageLayout title="ManabiNote">
      <p>ひらがなと えを おぼえよう</p>
      <PrimaryButton onClick={handleStart}>学習をはじめる</PrimaryButton>
      <PrimaryButton onClick={handleStrokePracticeStart}>書き順れんしゅう</PrimaryButton>
      <p><Link to="/history">履歴を見る</Link></p>
      {error && <p role="alert">問題を読み込めませんでした。</p>}
    </PageLayout>
  )
}
