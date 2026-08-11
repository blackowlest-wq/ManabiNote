import { Link, useNavigate } from 'react-router-dom'
import { useKanaPairSession } from '../../features/kana-pair/KanaPairSessionProvider'
import { isKanaPairComplete } from '../../features/kana-pair/model/kanaPairSession'
import { PageLayout } from '../../shared/components/PageLayout'
import { PrimaryButton } from '../../shared/components/PrimaryButton'

export function KanaPairResultPage() {
  const navigate = useNavigate()
  const { session, error, startSession } = useKanaPairSession()

  if (!session || !isKanaPairComplete(session)) {
    return (
      <PageLayout title="ペアゲームの けっか">
        <p>結果を表示できません。</p>
        {error && <p role="alert">{error.message}</p>}
        <Link to="/">ホームへ戻る</Link>
      </PageLayout>
    )
  }

  const handleRetry = () => {
    if (startSession()) navigate('/kana-pair')
  }

  return (
    <PageLayout title="ペアゲームの けっか" completedGameId="kana-pair">
      <div className="kana-pair-result">
        <h2>5もん できたね！</h2>
        <PrimaryButton onClick={handleRetry}>もういちど</PrimaryButton>
        <p><Link to="/">ホームへ戻る</Link></p>
      </div>
    </PageLayout>
  )
}
