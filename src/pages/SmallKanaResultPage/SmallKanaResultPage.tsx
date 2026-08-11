import { Link, useNavigate } from 'react-router-dom'
import { useSmallKanaSession } from '../../features/small-kana/SmallKanaSessionProvider'
import { isSmallKanaComplete } from '../../features/small-kana/model/smallKanaSession'
import { PageLayout } from '../../shared/components/PageLayout'
import { PrimaryButton } from '../../shared/components/PrimaryButton'

export function SmallKanaResultPage() {
  const navigate = useNavigate()
  const { session, error, startSession } = useSmallKanaSession()

  if (!session || !isSmallKanaComplete(session)) {
    return (
      <PageLayout title="ちいさい かなの けっか">
        <p>結果を表示できません。</p>
        {error && <p role="alert">{error.message}</p>}
        <Link to="/">ホームへ戻る</Link>
      </PageLayout>
    )
  }

  const handleRetry = () => {
    if (startSession()) navigate('/small-kana')
  }

  return (
    <PageLayout title="ちいさい かなの けっか" completedGameId="small-kana">
      <div className="small-kana-result">
        <h2>5もん できたね！</h2>
        <PrimaryButton onClick={handleRetry}>もういちど</PrimaryButton>
        <p><Link to="/">ホームへ戻る</Link></p>
      </div>
    </PageLayout>
  )
}
