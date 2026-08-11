import { Link, useNavigate } from 'react-router-dom'
import { useCountingSession } from '../../features/counting/CountingSessionProvider'
import { isCountingComplete } from '../../features/counting/model/countingSession'
import { PageLayout } from '../../shared/components/PageLayout'
import { PrimaryButton } from '../../shared/components/PrimaryButton'

export function CountingResultPage() {
  const navigate = useNavigate()
  const { session, error, startSession } = useCountingSession()

  if (!session || !isCountingComplete(session)) {
    return (
      <PageLayout title="かずの けっか">
        <p>結果を表示できません。</p>
        {error && <p role="alert">{error.message}</p>}
        <Link to="/">ホームへ戻る</Link>
      </PageLayout>
    )
  }

  const handleRetry = () => {
    if (startSession()) navigate('/counting')
  }

  return (
    <PageLayout title="かずの けっか">
      <div className="counting-result">
        <h2>5もん できたね！</h2>
        <PrimaryButton onClick={handleRetry}>もういちど</PrimaryButton>
        <p><Link to="/">ホームへ戻る</Link></p>
      </div>
    </PageLayout>
  )
}
