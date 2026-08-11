import { Link, useNavigate } from 'react-router-dom'
import { useClockSession } from '../../features/clock/ClockSessionProvider'
import { isClockComplete } from '../../features/clock/model/clockSession'
import { PageLayout } from '../../shared/components/PageLayout'
import { PrimaryButton } from '../../shared/components/PrimaryButton'
import { getDifficultyLabel } from '../../shared/gameDifficulty'

export function ClockResultPage() {
  const navigate = useNavigate()
  const { session, error, startSession } = useClockSession()

  if (!session || !isClockComplete(session)) {
    return (
      <PageLayout title="とけいの けっか">
        <p>結果を表示できません。</p>
        {error && <p role="alert">{error.message}</p>}
        <Link to="/numbers">かずの メニューへ</Link>
      </PageLayout>
    )
  }

  const handleRetry = () => {
    if (startSession(session.difficulty)) navigate('/clock')
  }

  return (
    <PageLayout title="とけいの けっか">
      <div className="clock-result">
        <h2>とけいの れんしゅう おわり！</h2>
        <p>むずかしさ：{getDifficultyLabel(session.difficulty)}</p>
        <p>{session.questions.length}もん できたね！</p>
        <PrimaryButton onClick={handleRetry}>もういちど</PrimaryButton>
        <p><Link to="/numbers">かずの メニューへ</Link></p>
      </div>
    </PageLayout>
  )
}
