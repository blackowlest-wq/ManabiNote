import { Link, useNavigate } from 'react-router-dom'
import { useQuizSession } from '../../features/quiz/QuizSessionProvider'
import { PageLayout } from '../../shared/components/PageLayout'
import { PrimaryButton } from '../../shared/components/PrimaryButton'

export function HomePage() {
  const navigate = useNavigate()
  const { startSession, error } = useQuizSession()

  const handleStart = () => {
    if (startSession()) navigate('/quiz')
  }

  return (
    <PageLayout title="ManabiNote">
      <p>ひらがなと えを おぼえよう</p>
      <PrimaryButton onClick={handleStart}>学習をはじめる</PrimaryButton>
      <p><Link to="/history">履歴を見る</Link></p>
      {error && <p role="alert">問題を読み込めませんでした。</p>}
    </PageLayout>
  )
}
