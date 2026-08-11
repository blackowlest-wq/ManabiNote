import { Link, useNavigate } from 'react-router-dom'
import { useKanaGroupSession } from '../../features/kana-group/KanaGroupSessionProvider'
import { isKanaGroupComplete } from '../../features/kana-group/model/kanaGroupSession'
import { PageLayout } from '../../shared/components/PageLayout'
import { PrimaryButton } from '../../shared/components/PrimaryButton'

export function KanaGroupResultPage() {
  const navigate = useNavigate()
  const { session, error, startSession } = useKanaGroupSession()

  if (!session || !isKanaGroupComplete(session)) {
    return (
      <PageLayout title="なかまわけの けっか">
        <p>結果を表示できません。</p>
        {error && <p role="alert">{error.message}</p>}
        <Link to="/">ホームへ戻る</Link>
      </PageLayout>
    )
  }

  const handleRetry = () => {
    if (startSession()) navigate('/kana-group')
  }

  return (
    <PageLayout title="なかまわけの けっか" completedGameId="kana-group">
      <div className="kana-group-result">
        <h2>5もん できたね！</h2>
        <PrimaryButton onClick={handleRetry}>もういちど</PrimaryButton>
        <p><Link to="/">ホームへ戻る</Link></p>
      </div>
    </PageLayout>
  )
}
