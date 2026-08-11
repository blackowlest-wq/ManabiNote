import { Link, useNavigate } from 'react-router-dom'
import { useParticleChoiceSession } from '../../features/particle-choice/ParticleChoiceSessionProvider'
import { isParticleChoiceComplete } from '../../features/particle-choice/model/particleChoiceSession'
import { PageLayout } from '../../shared/components/PageLayout'
import { PrimaryButton } from '../../shared/components/PrimaryButton'
import { getDifficultyLabel } from '../../shared/gameDifficulty'

export function ParticleChoiceResultPage() {
  const navigate = useNavigate()
  const { session, error, startSession } = useParticleChoiceSession()

  if (!session || !isParticleChoiceComplete(session)) {
    return (
      <PageLayout title="ぶんの けっか">
        <p>結果を表示できません。</p>
        {error && <p role="alert">{error.message}</p>}
        <Link to="/sentences">ぶんの メニューへ</Link>
      </PageLayout>
    )
  }

  const handleRetry = () => {
    if (startSession(session.difficulty)) navigate('/particle-choice')
  }

  return (
    <PageLayout title="ぶんの けっか" completedGameId="particle-choice">
      <div className="particle-choice-result">
        <h2>ことばつなぎ おわり！</h2>
        <p>むずかしさ：{getDifficultyLabel(session.difficulty)}</p>
        <p>{session.questions.length}もん できたね！</p>
        <PrimaryButton onClick={handleRetry}>もういちど</PrimaryButton>
        <p><Link to="/sentences">ぶんの メニューへ</Link></p>
      </div>
    </PageLayout>
  )
}
