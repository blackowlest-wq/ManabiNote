import { Link, useNavigate } from 'react-router-dom'
import { useWordBuilderSession } from '../../features/word-builder/WordBuilderSessionProvider'
import { isWordBuilderComplete } from '../../features/word-builder/model/wordBuilderSession'
import { PageLayout } from '../../shared/components/PageLayout'
import { PrimaryButton } from '../../shared/components/PrimaryButton'

export function WordBuilderResultPage() {
  const navigate = useNavigate()
  const { session, error, startSession } = useWordBuilderSession()

  if (!session || !isWordBuilderComplete(session)) {
    return (
      <PageLayout title="ことばのけっか">
        <p>結果を表示できません。</p>
        {error && <p role="alert">{error.message}</p>}
        <Link to="/">ホームへ戻る</Link>
      </PageLayout>
    )
  }

  const handleRetry = () => {
    if (startSession()) navigate('/word-builder')
  }

  return (
    <PageLayout title="ことばのけっか" completedGameId="word-builder">
      <div className="word-builder-result">
        <h2>5もん できたね！</h2>
        <PrimaryButton onClick={handleRetry}>もういちど</PrimaryButton>
        <p><Link to="/">ホームへ戻る</Link></p>
      </div>
    </PageLayout>
  )
}
