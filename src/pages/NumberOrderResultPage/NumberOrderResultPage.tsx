import { Link, useNavigate } from 'react-router-dom'
import { useNumberOrderSession } from '../../features/number-order/NumberOrderSessionProvider'
import { isNumberOrderComplete } from '../../features/number-order/model/numberOrderSession'
import { PageLayout } from '../../shared/components/PageLayout'
import { PrimaryButton } from '../../shared/components/PrimaryButton'

export function NumberOrderResultPage() {
  const navigate = useNavigate()
  const { session, error, startSession } = useNumberOrderSession()

  if (!session || !isNumberOrderComplete(session)) {
    return (
      <PageLayout title="かずの けっか">
        <p>結果を表示できません。</p>
        {error && <p role="alert">{error.message}</p>}
        <Link to="/numbers">かずの メニューへ</Link>
      </PageLayout>
    )
  }

  const handleRetry = () => {
    if (startSession()) navigate('/number-order')
  }

  return (
    <PageLayout title="かずの けっか" completedGameId="number-order">
      <div className="number-order-result">
        <h2>かずの れんしゅう おわり！</h2>
        <p>{session.questions.length}もん できたね！</p>
        <PrimaryButton onClick={handleRetry}>もういちど</PrimaryButton>
        <p><Link to="/numbers">かずの メニューへ</Link></p>
      </div>
    </PageLayout>
  )
}
