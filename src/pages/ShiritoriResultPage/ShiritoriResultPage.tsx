import { Link, useNavigate } from 'react-router-dom'
import { useShiritoriSession } from '../../features/shiritori/ShiritoriSessionProvider'
import { isShiritoriComplete } from '../../features/shiritori/model/shiritoriSession'
import { PageLayout } from '../../shared/components/PageLayout'
import { PrimaryButton } from '../../shared/components/PrimaryButton'

export function ShiritoriResultPage() {
  const navigate = useNavigate()
  const { session, error, startSession } = useShiritoriSession()

  if (!session || !isShiritoriComplete(session)) {
    return (
      <PageLayout title="しりとりの けっか">
        <p>結果を表示できません。</p>
        {error && <p role="alert">{error.message}</p>}
        <Link to="/">ホームへ戻る</Link>
      </PageLayout>
    )
  }

  const handleRetry = () => {
    if (startSession()) navigate('/shiritori')
  }

  return (
    <PageLayout title="しりとりの けっか" completedGameId="shiritori">
      <div className="shiritori-result">
        <h2>5もん できたね！</h2>
        <PrimaryButton onClick={handleRetry}>もういちど</PrimaryButton>
        <p><Link to="/">ホームへ戻る</Link></p>
      </div>
    </PageLayout>
  )
}
