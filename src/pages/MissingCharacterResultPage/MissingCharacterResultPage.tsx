import { Link, useNavigate } from 'react-router-dom'
import { useMissingCharacterSession } from '../../features/missing-character/MissingCharacterSessionProvider'
import { isMissingCharacterComplete } from '../../features/missing-character/model/missingCharacterSession'
import { PageLayout } from '../../shared/components/PageLayout'
import { PrimaryButton } from '../../shared/components/PrimaryButton'

export function MissingCharacterResultPage() {
  const navigate = useNavigate()
  const { session, error, startSession } = useMissingCharacterSession()

  if (!session || !isMissingCharacterComplete(session)) {
    return (
      <PageLayout title="あなうめの けっか">
        <p>結果を表示できません。</p>
        {error && <p role="alert">{error.message}</p>}
        <Link to="/">ホームへ戻る</Link>
      </PageLayout>
    )
  }

  const handleRetry = () => {
    if (startSession()) navigate('/missing-character')
  }

  return (
    <PageLayout title="あなうめの けっか" completedGameId="missing-character">
      <div className="missing-character-result">
        <h2>5もん できたね！</h2>
        <PrimaryButton onClick={handleRetry}>もういちど</PrimaryButton>
        <p><Link to="/">ホームへ戻る</Link></p>
      </div>
    </PageLayout>
  )
}
