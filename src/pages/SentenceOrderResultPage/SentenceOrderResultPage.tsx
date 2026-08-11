import { Link, useNavigate } from 'react-router-dom'
import { useSentenceOrderSession } from '../../features/sentence-order/SentenceOrderSessionProvider'
import { isSentenceOrderComplete } from '../../features/sentence-order/model/sentenceOrderSession'
import { PageLayout } from '../../shared/components/PageLayout'
import { PrimaryButton } from '../../shared/components/PrimaryButton'
import { getDifficultyLabel } from '../../shared/gameDifficulty'

export function SentenceOrderResultPage() {
  const navigate = useNavigate()
  const { session, error, startSession } = useSentenceOrderSession()

  if (!session || !isSentenceOrderComplete(session)) {
    return (
      <PageLayout title="ぶんの けっか">
        <p>結果を表示できません。</p>
        {error && <p role="alert">{error.message}</p>}
        <Link to="/sentences">ぶんの メニューへ</Link>
      </PageLayout>
    )
  }

  const handleRetry = () => {
    if (startSession(session.difficulty)) navigate('/sentence-order')
  }

  return (
    <PageLayout title="ぶんの けっか" completedGameId="sentence-order">
      <div className="sentence-order-result">
        <h2>ぶんの れんしゅう おわり！</h2>
        <p>むずかしさ：{getDifficultyLabel(session.difficulty)}</p>
        <p>{session.questions.length}もん できたね！</p>
        <PrimaryButton onClick={handleRetry}>もういちど</PrimaryButton>
        <p><Link to="/sentences">ぶんの メニューへ</Link></p>
      </div>
    </PageLayout>
  )
}
