import { Link, useNavigate } from 'react-router-dom'
import { useDakutenSession } from '../../features/dakuten/DakutenSessionProvider'
import { isDakutenComplete } from '../../features/dakuten/model/dakutenSession'
import { PageLayout } from '../../shared/components/PageLayout'
import { PrimaryButton } from '../../shared/components/PrimaryButton'

export function DakutenResultPage() {
  const navigate = useNavigate()
  const { session, error, startSession } = useDakutenSession()

  if (!session || !isDakutenComplete(session)) {
    return (
      <PageLayout title="てんてんの けっか">
        <p>結果を表示できません。</p>
        {error && <p role="alert">{error.message}</p>}
        <Link to="/">ホームへ戻る</Link>
      </PageLayout>
    )
  }

  const handleRetry = () => {
    if (startSession()) navigate('/dakuten')
  }

  return (
    <PageLayout title="てんてんの けっか">
      <div className="dakuten-result">
        <h2>5もん できたね！</h2>
        <PrimaryButton onClick={handleRetry}>もういちど</PrimaryButton>
        <p><Link to="/">ホームへ戻る</Link></p>
      </div>
    </PageLayout>
  )
}
