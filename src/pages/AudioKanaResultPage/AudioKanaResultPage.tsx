import { Link, useNavigate } from 'react-router-dom'
import { useAudioKanaSession } from '../../features/audio-kana/AudioKanaSessionProvider'
import { isAudioKanaComplete } from '../../features/audio-kana/model/audioKanaSession'
import { PageLayout } from '../../shared/components/PageLayout'
import { PrimaryButton } from '../../shared/components/PrimaryButton'

export function AudioKanaResultPage() {
  const navigate = useNavigate()
  const { session, error, startSession } = useAudioKanaSession()

  if (!session || !isAudioKanaComplete(session)) {
    return (
      <PageLayout title="おとの けっか">
        <p>結果を表示できません。</p>
        {error && <p role="alert">{error.message}</p>}
        <Link to="/">ホームへ戻る</Link>
      </PageLayout>
    )
  }

  const handleRetry = () => {
    if (startSession()) navigate('/audio-kana')
  }

  return (
    <PageLayout title="おとの けっか">
      <div className="audio-kana-result">
        <h2>5もん できたね！</h2>
        <PrimaryButton onClick={handleRetry}>もういちど</PrimaryButton>
        <p><Link to="/">ホームへ戻る</Link></p>
      </div>
    </PageLayout>
  )
}
