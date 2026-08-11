import { Link, useNavigate } from 'react-router-dom'
import { useMemorySession } from '../../features/memory/MemorySessionProvider'
import { isMemoryComplete } from '../../features/memory/model/memorySession'
import { PageLayout } from '../../shared/components/PageLayout'
import { PrimaryButton } from '../../shared/components/PrimaryButton'

export function MemoryResultPage() {
  const navigate = useNavigate()
  const { session, error, startSession } = useMemorySession()

  if (!session || !isMemoryComplete(session)) {
    return (
      <PageLayout title="しんけいすいじゃくの けっか">
        <p>結果を表示できません。</p>
        {error && <p role="alert">{error.message}</p>}
        <Link to="/">ホームへ戻る</Link>
      </PageLayout>
    )
  }

  const handleRetry = () => {
    if (startSession()) navigate('/memory')
  }

  return (
    <PageLayout title="しんけいすいじゃくの けっか">
      <div className="memory-result">
        <h2>{session.moves}かいで 4くみ そろえたね！</h2>
        <PrimaryButton onClick={handleRetry}>もういちど</PrimaryButton>
        <p><Link to="/">ホームへ戻る</Link></p>
      </div>
    </PageLayout>
  )
}
