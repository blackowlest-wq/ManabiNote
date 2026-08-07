import { Link, useNavigate } from 'react-router-dom'
import { useQuizSession } from '../../features/quiz/QuizSessionProvider'
import { useStrokePractice } from '../../features/stroke-order/StrokePracticeProvider'
import { PageLayout } from '../../shared/components/PageLayout'
import { PrimaryButton } from '../../shared/components/PrimaryButton'

export function HomePage() {
  const navigate = useNavigate()
  const { startSession, error } = useQuizSession()
  const { resetPractice } = useStrokePractice()

  const handleStart = () => {
    if (startSession()) navigate('/quiz')
  }

  const handleStrokePracticeStart = () => {
    resetPractice()
    navigate('/stroke-order')
  }

  return (
    <PageLayout title="ManabiNote">
      <p>ひらがなと えを おぼえよう</p>
      <div className="home-actions" data-testid="home-actions">
        <PrimaryButton onClick={handleStart}>ひらがなから えを えらぼう</PrimaryButton>
        <PrimaryButton onClick={handleStrokePracticeStart}>書き順れんしゅう</PrimaryButton>
        <Link className="primary-button" to="/word-builder">ことばをつくろう</Link>
      </div>
      <p><Link to="/history">履歴を見る</Link></p>
      {error && <p role="alert">問題を読み込めませんでした。</p>}
    </PageLayout>
  )
}
